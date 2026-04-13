"""
학습된 Gemma 2 어댑터 추론 유틸리티

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
import sys
from pathlib import Path

# 프로젝트 루트를 sys.path에 추가
ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT))

# ── 상수 ──────────────────────────────────────────────────────────────────────
ADAPTER_PATH = str(ROOT / "models" / "gemma2-fitness-lora")
DATASET_CONFIG_PATH = str(ROOT / "data" / "dataset_config.json")
MAX_SEQ_LENGTH = 2048
MAX_NEW_TOKENS = 512


def _load_instruction() -> str:
    with open(DATASET_CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)["instruction"]


def _build_prompt(instruction: str, input_text: str, retrieved_context: str = "") -> str:
    """Gemma 2 chat template 포맷.

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
        except ImportError:
            raise ImportError("pip install unsloth 으로 설치하세요.")

        import torch
        self._torch = torch

        if not Path(adapter_path).exists():
            raise FileNotFoundError(
                f"어댑터를 찾을 수 없습니다: {adapter_path}\n"
                "train.py 를 먼저 실행해 모델을 학습하세요."
            )

        print(f"어댑터 로드 중: {adapter_path}")
        self.model, self.tokenizer = FastLanguageModel.from_pretrained(
            model_name=adapter_path,
            max_seq_length=MAX_SEQ_LENGTH,
            load_in_4bit=True,
        )
        FastLanguageModel.for_inference(self.model)

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
        inputs = self.tokenizer(prompt, return_tensors="pt").to("cuda")

        with self._torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=MAX_NEW_TOKENS,
                temperature=self.temperature,
                do_sample=True,
                repetition_penalty=self.repetition_penalty,
            )

        generated = outputs[0][inputs["input_ids"].shape[1]:]
        return self.tokenizer.decode(generated, skip_special_tokens=True).strip()


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
