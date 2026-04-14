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
MAX_NEW_TOKENS = 512


def _offload_vision_encoder(model, torch) -> None:
    """텍스트 전용 추론 시 비전 인코더를 CPU로 오프로드하여 VRAM 해제.

    Gemma 4 멀티모달 구조:
        vision_tower          — SigLIP 이미지 인코더
        multi_modal_projector — 비전 피처 → 언어 공간 변환 MLP
    unsloth가 모델을 래핑하므로 model / model.model 두 레벨을 모두 탐색.
    """
    VISION_ATTRS = ("vision_tower", "multi_modal_projector", "vision_model", "image_encoder")

    targets = [model]
    if hasattr(model, "model"):
        targets.append(model.model)

    offloaded = []
    for target in targets:
        for attr in VISION_ATTRS:
            component = getattr(target, attr, None)
            if component is not None:
                component.to("cpu")
                offloaded.append(attr)

    if offloaded:
        torch.cuda.empty_cache()
        print(f"비전 인코더 CPU 오프로드 완료: {offloaded}")
    else:
        print("비전 인코더 컴포넌트 없음 (텍스트 전용 모델 또는 이미 비활성화됨)")


def _load_instruction() -> str:
    with open(DATASET_CONFIG_PATH, encoding="utf-8") as f:
        return json.loads(f.read(), strict=False)["instruction"]


def _build_prompt(instruction: str, input_text: str, retrieved_context: str = "") -> str:
    """Gemma 4 chat template 포맷.

    retrieved_context: RAG로 검색된 유사 사례 (비어 있으면 일반 SFT 추론)
    """
    user_content = instruction
    if retrieved_context:
        user_content += f"\n\n[참고 사례]\n{retrieved_context}"
    user_content += f"\n\n{input_text}"

    return (
        f"<start_of_turn>user\n{user_content}<end_of_turn>\n"
        f"<start_of_turn>model\n"
    )


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
        # dtype=float16 명시: 양자화 외부 가중치(레이어 노름·임베딩·LoRA)가
        # float32로 잡히지 않도록 강제 → VRAM ~2GB 절감
        print(f"어댑터 로드 중: {adapter_path}")
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name=adapter_path,
            max_seq_length=MAX_SEQ_LENGTH,
            load_in_4bit=True,
            dtype=self._dtype,
        )
        FastLanguageModel.for_inference(self.model)

        # 텍스트 전용 추론: 비전 인코더를 CPU로 오프로드하여 VRAM 절감
        _offload_vision_encoder(self.model, self._torch)

        # 로드 과정에서 생긴 임시 CUDA 할당 해제
        self._torch.cuda.empty_cache()

        # VRAM 사용량으로 4-bit 적용 여부 검증 ───────────────────────────────
        vram_gb = self._torch.cuda.memory_allocated() / 1024 ** 3
        total_gb = self._torch.cuda.get_device_properties(0).total_memory / 1024 ** 3
        free_gb = total_gb - self._torch.cuda.memory_reserved() / 1024 ** 3
        print(
            f"VRAM: 사용 {vram_gb:.1f}GB / 전체 {total_gb:.1f}GB / 여유 {free_gb:.1f}GB"
        )
        # Gemma 4 E2B 4-bit 정상 로드 기준: ~2~3GB (비전 인코더 CPU 오프로드 후)
        # 5GB 초과 시 FP16 로드로 판단 → generate 중 OOM → os._exit(0) 원인
        if vram_gb > 5.0:
            print(
                f"[WARN] VRAM {vram_gb:.1f}GB — 4-bit 양자화가 적용되지 않았습니다!\n"
                "       bitsandbytes CUDA 지원이 누락되어 FP16으로 로드된 것으로 보입니다.\n"
                "       → generate 중 OOM으로 인해 서버가 exit 0으로 종료될 수 있습니다.\n"
                "       해결: pip install bitsandbytes --upgrade --force-reinstall"
            )

        self.instruction = _load_instruction()
        self.temperature = temperature
        self.repetition_penalty = repetition_penalty
        print("로드 완료.\n")

    def analyze(self, input_text: str, retrieved_context: str = "") -> str:
        """회원 운동 기록을 분석하고 피드백을 반환한다.

        Args:
            input_text: prepare_dataset.py 의 input 포맷과 동일한 문자열
            retrieved_context: RAG 검색 결과 (선택 사항)

        Returns:
            트레이너 피드백 문자열
        """
        prompt = _build_prompt(self.instruction, input_text, retrieved_context)
        inputs = self.tokenizer(text=prompt, return_tensors="pt").to("cuda")
        # 비전 인코더가 CPU로 오프로드되어 있으므로, vision 관련 키가 있으면 제거
        inputs.pop("pixel_values", None)
        inputs.pop("image_sizes", None)

        try:
            with self._torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_new_tokens=MAX_NEW_TOKENS,
                    temperature=self.temperature,
                    do_sample=True,
                    repetition_penalty=self.repetition_penalty,
                    eos_token_id=self.tokenizer.eos_token_id,
                    pad_token_id=self.tokenizer.eos_token_id,
                    use_cache=True,
                )
        except BaseException as e:
            # SystemExit, KeyboardInterrupt 등 C 레벨 종료 신호도 포함하여 포착
            raise RuntimeError(f"모델 생성 실패: {type(e).__name__}: {e}") from e

        generated = outputs[0][inputs["input_ids"].shape[1]:]
        return self.tokenizer.decode(generated, skip_special_tokens=True).strip()


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
    _INFER_TIMEOUT = 120    # 추론 대기 (초)

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
            raise RuntimeError(f"추론 타임아웃 ({self._INFER_TIMEOUT}초)")

        if "error" in resp:
            raise RuntimeError(resp["error"])
        return resp["result"]

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
