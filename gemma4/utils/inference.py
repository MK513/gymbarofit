"""
학습된 Gemma 4 어댑터 추론 유틸리티

사용법:
    # 기본 실행 (대화형)
    python utils/inference.py

    # 파이프라인으로 사용
    from utils.inference import FitnessAdvisor
    advisor = FitnessAdvisor()
    print(advisor.analyze(input_text))

RAG 확장 시:
    advisor.analyze(input_text, retrieved_context="참고 사례: ...")
"""

import json
import multiprocessing as mp
import queue as stdlib_queue
import sys
import threading
import traceback
from pathlib import Path

# 프로젝트 루트를 sys.path에 추가
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

# ── 상수 ──────────────────────────────────────────────────────────────────────
# BASE_MODEL_PATH: 로컬에 다운로드된 Gemma 4 E2B 베이스 모델 경로
BASE_MODEL_PATH = str(ROOT / "models" / "unsloth-gemma-4-E2B-it-unsloth-bnb-4bit")
ADAPTER_PATH = str(ROOT / "models" / "gemma4-E2B-fitness-lora")
DATASET_CONFIG_PATH = str(ROOT / "data" / "dataset_config.json")
MAX_SEQ_LENGTH = 512
MAX_NEW_TOKENS = 100


def _offload_vision_encoder(model, torch) -> None:
    """텍스트 전용 추론 시 비전 인코더를 CPU로 오프로드하여 VRAM 해제.

    Gemma 4 멀티모달 구조:
        vision_tower          — SigLIP 이미지 인코더
        multi_modal_projector — 비전 피처 → 언어 공간 변환 MLP
    unsloth + PEFT 래핑으로 인해 실제 컴포넌트 경로가 달라질 수 있으므로
    깊이 제한 없이 최상위 비전 컴포넌트를 탐색한다.
    """
    VISION_KEYWORDS = ("vision", "image", "visual", "siglip", "multi_modal")

    # 최상위 자식 모듈만 대상으로 탐색 (하위는 상위 오프로드 시 자동 이동)
    top_level_children = list(model.named_children())
    # top-level이 base_model 하나뿐인 PEFT 구조를 재귀적으로 펼침
    expanded: list[tuple[str, object]] = []
    for name, child in top_level_children:
        sub = list(child.named_children())
        if sub:
            expanded.extend((f"{name}.{n}", m) for n, m in sub)
        else:
            expanded.append((name, child))
    search_targets = top_level_children + expanded

    offloaded: list[str] = []
    offloaded_prefixes: set[str] = set()

    for name, module in search_targets:
        if not any(kw in name.lower() for kw in VISION_KEYWORDS):
            continue
        if any(name.startswith(prefix + ".") for prefix in offloaded_prefixes):
            continue
        module.to("cpu")
        offloaded.append(name)
        offloaded_prefixes.add(name)

    if offloaded:
        torch.cuda.empty_cache()
        print(f"비전 인코더 CPU 오프로드 완료: {offloaded}")
    else:
        # 진단: 실제 최상위 모듈 이름 출력해 키워드 불일치 여부 확인
        top_names = [n for n, _ in model.named_children()]
        print(f"비전 인코더 컴포넌트 없음. 최상위 모듈: {top_names}")


def _load_instruction() -> str:
    with open(DATASET_CONFIG_PATH, encoding="utf-8") as f:
        return json.loads(f.read(), strict=False)["instruction"]


def _build_user_content(instruction: str, input_text: str, retrieved_context: str = "") -> str:
    """user 턴의 텍스트 콘텐츠를 반환한다 (chat template 적용은 analyze에서 처리)."""
    user_content = instruction
    if retrieved_context:
        user_content += f"\n\n[참고 사례]\n{retrieved_context}"
    user_content += f"\n\n{input_text}"
    return user_content


# ── FitnessAdvisor 클래스 ──────────────────────────────────────────────────────

class FitnessAdvisor:
    """학습된 어댑터를 로드하고 추론하는 클래스."""

    def __init__(
        self,
        adapter_path: str = ADAPTER_PATH,
        temperature: float = 0.7,
        repetition_penalty: float = 1.1,
    ):
        try:
            from unsloth import FastLanguageModel
        except ImportError as e:
            raise ImportError(
                f"unsloth import 실패 (원인: {e})\n"
                "pip install unsloth 으로 설치하세요."
            ) from e

        import torch
        self._torch = torch
        self._dtype = torch.float16

        # bitsandbytes 4-bit CUDA 동작 검증 ─────────────────────────────────────
        # COMPILED_WITH_CUDA는 빌드 시점 플래그라 런타임 CUDA 커널 동작을 보장하지 않음.
        # 실제 4-bit 연산을 직접 실행해 CUDA 커널이 정상인지 확인한다.
        try:
            import bitsandbytes as bnb
            import bitsandbytes.functional as bnb_F
        except ImportError as e:
            raise ImportError(
                "bitsandbytes 미설치. 4-bit 양자화를 사용할 수 없습니다.\n"
                "pip install bitsandbytes --upgrade"
            ) from e

        try:
            _test = torch.zeros(1, 64, device="cuda", dtype=torch.float16)
            bnb_F.quantize_4bit(_test, quant_type="nf4")
            del _test
            torch.cuda.empty_cache()
            print(f"bitsandbytes {bnb.__version__}: 4-bit CUDA 동작 확인")
        except Exception as e:
            raise RuntimeError(
                f"bitsandbytes {bnb.__version__} 4-bit CUDA 커널 오류: {e}\n"
                "Dockerfile에 CUDA_HOME=/usr/local/cuda 설정 후 이미지를 재빌드하세요.\n"
                "  docker compose build --no-cache && docker compose up"
            ) from e

        if not Path(adapter_path).exists():
            raise FileNotFoundError(
                f"어댑터를 찾을 수 없습니다: {adapter_path}\n"
                "train.py 를 먼저 실행해 모델을 학습하세요."
            )
        if not Path(BASE_MODEL_PATH).exists():
            raise FileNotFoundError(
                f"베이스 모델을 찾을 수 없습니다: {BASE_MODEL_PATH}\n"
                "models/unsloth-gemma-4-E2B-it-unsloth-bnb-4bit 경로에 모델을 배치하세요."
            )

        # adapter_config.json의 base_model_name_or_path를 로컬 경로로 패치
        # → unsloth가 HF 허브 대신 로컬 베이스 모델을 직접 읽도록 유도
        adapter_cfg_path = Path(adapter_path) / "adapter_config.json"
        if adapter_cfg_path.exists():
            with open(adapter_cfg_path, encoding="utf-8") as f:
                adapter_cfg = json.loads(f.read(), strict=False)
            if adapter_cfg.get("base_model_name_or_path") != BASE_MODEL_PATH:
                adapter_cfg["base_model_name_or_path"] = BASE_MODEL_PATH
                with open(adapter_cfg_path, "w", encoding="utf-8") as f:
                    json.dump(adapter_cfg, f, indent=2, ensure_ascii=False)
                print(f"adapter_config.json 패치 완료: base_model → {BASE_MODEL_PATH}")

        # unsloth 고유 방식으로 어댑터 로드 (Gemma4ClippableLinear 호환)
        # bnb_4bit_* 파라미터 명시: 베이스 모델 config.json에 저장된 quantization_config와
        # 충돌 시 FP16으로 조용히 폴백하는 문제를 방지한다.
        print(f"어댑터 로드 중: {adapter_path}")
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name=adapter_path,
            max_seq_length=MAX_SEQ_LENGTH,
            load_in_4bit=True,
            dtype=self._dtype,
        )
        FastLanguageModel.for_inference(self.model)

        # torch.compile: 연산 그래프 커널 퓨전으로 토큰 생성 속도 개선
        # fullgraph=False → unsloth/bnb 커스텀 op는 eager 폴백, 나머지만 컴파일
        # 첫 실행(워밍업)에서 컴파일이 일어나므로 서버 시작 시간은 늘어남
        try:
            self.model = self._torch.compile(
                self.model,
                mode="reduce-overhead",
                fullgraph=False,
            )
            print("torch.compile 적용 완료 (워밍업 시 컴파일 수행)")
        except Exception as e:
            print(f"[WARN] torch.compile 실패, eager 모드 유지: {e}")

        # 텍스트 전용 추론: 비전 인코더를 CPU로 오프로드하여 VRAM 절감
        _offload_vision_encoder(self.model, self._torch)

        # 로드 과정에서 생긴 임시 CUDA 할당 해제
        self._torch.cuda.empty_cache()

        # 4-bit 적용 여부 진단 ────────────────────────────────────────────────
        # Linear4bit 레이어 수로 실제 양자화 여부를 직접 확인
        n_4bit = sum(
            1 for _, m in self.model.named_modules()
            if isinstance(m, bnb.nn.Linear4bit)
        )
        vram_gb = self._torch.cuda.memory_allocated() / 1024 ** 3
        total_gb = self._torch.cuda.get_device_properties(0).total_memory / 1024 ** 3
        free_gb = total_gb - self._torch.cuda.memory_reserved() / 1024 ** 3
        print(
            f"VRAM: 사용 {vram_gb:.1f}GB / 전체 {total_gb:.1f}GB / 여유 {free_gb:.1f}GB"
        )
        print(f"Linear4bit 레이어 수: {n_4bit}")

        if n_4bit == 0:
            # 4-bit 레이어가 하나도 없으면 FP16으로 로드된 것
            print(
                f"[WARN] 4-bit 레이어 없음 — FP16 모드로 로드됨 (VRAM {vram_gb:.1f}GB)\n"
                "       원인: bitsandbytes가 pre-quantized 모델을 역직렬화하지 못한 것으로 보임.\n"
                "       → 재빌드 필요: docker compose build --no-cache"
            )
        else:
            print(f"4-bit 양자화 정상 적용 ({n_4bit}개 레이어)")

        # VRAM 상세 진단: 모듈별 디바이스 분포 출력
        device_map: dict[str, int] = {"cuda": 0, "cpu": 0}
        for _, param in self.model.named_parameters():
            key = "cuda" if param.device.type == "cuda" else "cpu"
            device_map[key] += param.numel()
        print(
            f"파라미터 분포 — GPU: {device_map['cuda']/1e6:.1f}M "
            f"/ CPU: {device_map['cpu']/1e6:.1f}M"
        )

        self.instruction = _load_instruction()
        self.temperature = temperature
        self.repetition_penalty = repetition_penalty

        # 워밍업: 첫 실제 요청의 CUDA 커널 JIT 지연 제거
        print("워밍업 추론 중...")
        try:
            self.analyze("나이: 25세 | 성별: 남성 | 체중: 70kg")
            print("워밍업 완료.")
        except Exception as e:
            print(f"[WARN] 워밍업 실패 (무시): {e}")

        print("로드 완료.\n")

    def analyze(self, input_text: str, retrieved_context: str = "") -> str:
        """회원 운동 기록을 분석하고 피드백을 반환한다.

        Args:
            input_text: prepare_dataset.py 의 input 포맷과 동일한 문자열
            retrieved_context: RAG 검색 결과 (선택 사항)

        Returns:
            트레이너 피드백 문자열
        """
        user_content = _build_user_content(self.instruction, input_text, retrieved_context)
        messages = [{"role": "user", "content": user_content}]
        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self.tokenizer(text=prompt, return_tensors="pt").to("cuda")
        # 비전 인코더가 CPU로 오프로드되어 있으므로, vision 관련 키가 있으면 제거
        inputs.pop("pixel_values", None)
        inputs.pop("image_sizes", None)

        # <end_of_turn> 토큰을 EOS 목록에 추가해 무한 생성 방지
        # Gemma4Processor는 멀티모달 래퍼이므로 내부 text tokenizer를 통해 접근
        _tok = getattr(self.tokenizer, "tokenizer", self.tokenizer)
        end_of_turn_id = _tok.convert_tokens_to_ids("<end_of_turn>")
        eos_ids = [self.tokenizer.eos_token_id]
        if end_of_turn_id and end_of_turn_id != self.tokenizer.eos_token_id:
            eos_ids.append(end_of_turn_id)

        try:
            with self._torch.inference_mode():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=MAX_NEW_TOKENS,
                    do_sample=False,
                    eos_token_id=eos_ids,
                    pad_token_id=self.tokenizer.eos_token_id,
                    use_cache=True,
                )
        except BaseException as e:
            # SystemExit, KeyboardInterrupt 등 C 레벨 종료 신호도 포함하여 포착
            raise RuntimeError(f"모델 생성 실패: {type(e).__name__}: {e}") from e

        generated = outputs[0][inputs["input_ids"].shape[1]:]
        return self.tokenizer.decode(generated, skip_special_tokens=True).strip()

    def stream_analyze(self, input_text: str, retrieved_context: str = ""):
        """토큰을 생성하는 즉시 yield하는 스트리밍 버전.

        TextIteratorStreamer를 통해 백그라운드 스레드에서 model.generate()를
        실행하고, 메인 스레드에서 생성된 토큰을 순차적으로 yield한다.
        """
        from transformers import TextIteratorStreamer

        user_content = _build_user_content(self.instruction, input_text, retrieved_context)
        messages = [{"role": "user", "content": user_content}]
        prompt = self.tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self.tokenizer(text=prompt, return_tensors="pt").to("cuda")
        inputs.pop("pixel_values", None)
        inputs.pop("image_sizes", None)

        _tok = getattr(self.tokenizer, "tokenizer", self.tokenizer)
        end_of_turn_id = _tok.convert_tokens_to_ids("<end_of_turn>")
        eos_ids = [self.tokenizer.eos_token_id]
        if end_of_turn_id and end_of_turn_id != self.tokenizer.eos_token_id:
            eos_ids.append(end_of_turn_id)

        # skip_prompt=True: 입력 프롬프트 토큰은 건너뛰고 생성 토큰만 yield
        streamer = TextIteratorStreamer(
            _tok,
            skip_prompt=True,
            skip_special_tokens=True,
        )

        generate_kwargs = dict(
            **inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=False,
            eos_token_id=eos_ids,
            pad_token_id=self.tokenizer.eos_token_id,
            use_cache=True,
            streamer=streamer,
        )

        # model.generate()는 블로킹 호출이므로 별도 스레드에서 실행
        # inference_mode는 스레드 로컬이므로 해당 스레드 내에서 적용
        def _generate():
            try:
                with self._torch.inference_mode():
                    self.model.generate(**generate_kwargs)
            except BaseException as e:
                # 생성 실패 시 streamer를 강제 종료해 메인 스레드의 for 루프를 탈출
                streamer.on_finalized_text("", stream_end=True)
                raise RuntimeError(f"모델 생성 실패: {type(e).__name__}: {e}") from e

        gen_thread = threading.Thread(target=_generate, daemon=True)
        gen_thread.start()

        for token_text in streamer:
            if token_text:
                yield token_text

        gen_thread.join()


# ── 서브프로세스 워커 ─────────────────────────────────────────────────────────

def _inference_worker(
    request_queue: mp.Queue,
    response_queue: mp.Queue,
    adapter_path: str,
    temperature: float,
    repetition_penalty: float,
) -> None:
    """별도 프로세스에서 모델을 로드하고 추론 요청을 처리한다.

    os._exit() 같은 C 레벨 종료가 발생해도 메인 서버 프로세스에는 영향 없다.
    """
    try:
        advisor = FitnessAdvisor(adapter_path, temperature, repetition_penalty)
        response_queue.put({"ready": True})
    except Exception:
        response_queue.put({"ready": False, "error": traceback.format_exc()})
        return

    while True:
        task = request_queue.get()
        if task is None:  # 종료 신호
            break
        try:
            if task.get("stream"):
                for token in advisor.stream_analyze(task["input_text"], task.get("retrieved_context", "")):
                    response_queue.put({"token": token})
                response_queue.put({"done": True})
            else:
                result = advisor.analyze(task["input_text"], task.get("retrieved_context", ""))
                response_queue.put({"result": result})
        except Exception:
            response_queue.put({"error": traceback.format_exc()})


class InferenceWorker:
    """FitnessAdvisor를 별도 프로세스에서 실행하는 래퍼.

    model.generate() 내부에서 os._exit()이 호출되어 프로세스가 종료되어도
    FastAPI 메인 프로세스는 살아있고, 다음 요청 시 워커를 자동 재시작한다.
    """

    _STARTUP_TIMEOUT = 300  # 모델 로드 대기 (초)
    _INFER_TIMEOUT = 300    # 추론 대기 (초) — FP16 모드에서도 256 토큰 생성 수용

    def __init__(
        self,
        adapter_path: str = ADAPTER_PATH,
        temperature: float = 0.7,
        repetition_penalty: float = 1.1,
    ):
        self._adapter_path = adapter_path
        self._temperature = temperature
        self._repetition_penalty = repetition_penalty
        self._start_worker()

    def _start_worker(self) -> None:
        # CUDA는 fork 후 동작이 불안정하므로 반드시 spawn 사용
        ctx = mp.get_context("spawn")
        self._req_q: mp.Queue = ctx.Queue()
        self._res_q: mp.Queue = ctx.Queue()
        self._process = ctx.Process(
            target=_inference_worker,
            args=(self._req_q, self._res_q, self._adapter_path, self._temperature, self._repetition_penalty),
            daemon=True,
        )
        self._process.start()
        print(f"추론 워커 프로세스 시작 (PID {self._process.pid})")

        try:
            resp = self._res_q.get(timeout=self._STARTUP_TIMEOUT)
        except stdlib_queue.Empty:
            self._process.terminate()
            raise RuntimeError("워커 초기화 타임아웃 (300초)")

        if not resp.get("ready"):
            raise RuntimeError(f"워커 초기화 실패:\n{resp.get('error')}")

        print(f"추론 워커 준비 완료 (PID {self._process.pid})")

    def analyze(self, input_text: str, retrieved_context: str = "") -> str:
        if not self._process.is_alive():
            print(f"[WARN] 워커 프로세스 종료 감지 (exit code {self._process.exitcode}). 재시작 중...")
            self._start_worker()

        self._req_q.put({"input_text": input_text, "retrieved_context": retrieved_context})

        try:
            resp = self._res_q.get(timeout=self._INFER_TIMEOUT)
        except stdlib_queue.Empty:
            # 타임아웃: 워커가 아직 생성 중 → 강제 종료하여 다음 요청에서 자동 재시작
            if self._process.is_alive():
                self._process.terminate()
                self._process.join(timeout=5)
            raise RuntimeError(f"추론 타임아웃 ({self._INFER_TIMEOUT}초) — 워커를 재시작합니다.")

        if "error" in resp:
            raise RuntimeError(resp["error"])
        return resp["result"]

    def stream_analyze(self, input_text: str, retrieved_context: str = ""):
        """토큰이 생성될 때마다 즉시 yield하는 스트리밍 버전.

        워커 프로세스에서 토큰이 생성되는 즉시 Queue를 통해 전달받아 yield한다.
        """
        if not self._process.is_alive():
            print(f"[WARN] 워커 프로세스 종료 감지 (exit code {self._process.exitcode}). 재시작 중...")
            self._start_worker()

        self._req_q.put({"input_text": input_text, "retrieved_context": retrieved_context, "stream": True})

        # 토큰 단위 타임아웃: 생성이 시작된 후 토큰 간격은 짧으므로 30초면 충분
        _TOKEN_TIMEOUT = 30
        while True:
            try:
                resp = self._res_q.get(timeout=_TOKEN_TIMEOUT)
            except stdlib_queue.Empty:
                if self._process.is_alive():
                    self._process.terminate()
                    self._process.join(timeout=5)
                raise RuntimeError(f"스트리밍 타임아웃 ({_TOKEN_TIMEOUT}초) — 워커를 재시작합니다.")

            if "error" in resp:
                raise RuntimeError(resp["error"])
            if "done" in resp:
                return
            yield resp["token"]

    def shutdown(self) -> None:
        if self._process.is_alive():
            self._req_q.put(None)
            self._process.join(timeout=5)
            if self._process.is_alive():
                self._process.terminate()


# ── 대화형 CLI ────────────────────────────────────────────────────────────────

def _interactive_cli():
    advisor = FitnessAdvisor()
    print("=" * 60)
    print("GymBaroFit AI 트레이너 (종료: Ctrl+C 또는 'quit')")
    print("=" * 60)

    sample = (
        "나이: 28세 | 성별: 여성 | 체중: 58.0kg | 키: 1.65m | BMI: 21.3(정상)\n"
        "체지방률: 24.0% | 안정시 심박수: 62bpm\n"
        "운동 유형: 근력 | 경험 수준: 초급 | 주 3회 운동\n"
        "이번 세션: 1.0시간 | 평균 심박수: 135bpm | 최대 심박수: 175bpm\n"
        "소모 칼로리: 420kcal | 수분 섭취: 1.5L"
    )
    print(f"\n샘플 입력 형식:\n{sample}\n")

    while True:
        try:
            print("회원 데이터를 입력하세요 (여러 줄, 빈 줄로 완료):")
            lines = []
            while True:
                line = input()
                if line.strip().lower() == "quit":
                    print("종료합니다.")
                    return
                if line == "":
                    break
                lines.append(line)

            if not lines:
                continue

            input_text = "\n".join(lines)
            print("\n분석 중...\n")
            response = advisor.analyze(input_text)
            print("-" * 60)
            print(response)
            print("-" * 60 + "\n")

        except KeyboardInterrupt:
            print("\n종료합니다.")
            break


if __name__ == "__main__":
    _interactive_cli()
