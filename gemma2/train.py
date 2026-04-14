"""
Gemma 4 E2B SFT 학습 스크립트 (Unsloth + TRL)
대상: Google Colab T4 GPU

실행 방법:
    python train.py

사전 설치:
    pip install unsloth trl peft transformers datasets bitsandbytes pyyaml wandb
"""

import json
import os
from pathlib import Path

import yaml

# ── 설정 로드 ──────────────────────────────────────────────────────────────────
ROOT = Path(__file__).parent
CONFIG_PATH = ROOT / "config" / "lora_config.yaml"

with open(CONFIG_PATH, encoding="utf-8") as f:
    cfg = yaml.safe_load(f)

# 섹션별 단축 변수
_model    = cfg["model"]
_lora     = cfg["lora"]
_data     = cfg["data"]
_training = cfg["training"]
_wandb    = cfg["wandb"]

MODEL_NAME         = _model["name"]
MAX_SEQ_LENGTH     = _model["max_seq_length"]

LORA_R             = _lora["r"]
LORA_ALPHA         = _lora["alpha"]
LORA_DROPOUT       = _lora["dropout"]
TARGET_MODULES     = _lora["target_modules"]
USE_RSLORA         = _lora["use_rslora"]

TRAIN_DATA_PATH    = _data["train_path"]
VAL_DATA_PATH      = _data["val_path"]
DATASET_CONFIG_PATH = _data["dataset_config_path"]

OUTPUT_DIR                    = _training["output_dir"]
PER_DEVICE_TRAIN_BATCH_SIZE   = _training["batch_size"]
GRADIENT_ACCUMULATION_STEPS   = _training["gradient_accumulation_steps"]
NUM_TRAIN_EPOCHS              = _training["num_epochs"]
LEARNING_RATE                 = _training["learning_rate"]
LR_SCHEDULER_TYPE             = _training["lr_scheduler_type"]
WARMUP_RATIO                  = _training["warmup_ratio"]
OPTIMIZER                     = _training["optimizer"]
WEIGHT_DECAY                  = _training["weight_decay"]
FP16                          = _training["fp16"]
BF16                          = _training["bf16"]
GRADIENT_CHECKPOINTING        = _training["gradient_checkpointing"]
GRADIENT_CHECKPOINTING_KWARGS = {"use_reentrant": False}
LOGGING_STEPS                 = _training["log_interval"]
EVAL_STRATEGY                 = "steps"
EVAL_STEPS                    = _training["eval_interval"]
SAVE_STRATEGY                 = "steps"
SAVE_STEPS                    = _training["save_interval"]
SAVE_TOTAL_LIMIT              = _training["save_total_limit"]
LOAD_BEST_MODEL_AT_END        = True
METRIC_FOR_BEST_MODEL         = "eval_loss"

WANDB_REPORT_TO = _wandb["report_to"]
WANDB_TEAM      = _wandb.get("team", "")
WANDB_PROJECT   = _wandb.get("project", "gymbarofit-gemma4-E2B")
WANDB_RUN_NAME  = _wandb.get("run_name", "gemma4-E2B-fitness-lora")

# ── 외부 라이브러리 ────────────────────────────────────────────────────────────
try:
    from unsloth import FastLanguageModel
except ImportError:
    raise ImportError(
        "unsloth 가 설치되어 있지 않습니다.\n"
        "pip install unsloth 으로 설치 후 다시 실행하세요."
    )

from datasets import Dataset
from trl import SFTTrainer, SFTConfig


# ── 1. 모델 + Tokenizer 로드 ───────────────────────────────────────────────────

def load_model():
    print(f"[1/5] 모델 로드: {MODEL_NAME}")
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name=MODEL_NAME,
        max_seq_length=MAX_SEQ_LENGTH,
        load_in_4bit=True,
        dtype=None,            # 자동 감지 (T4 → float16)
    )

    model = FastLanguageModel.get_peft_model(
        model,
        r=LORA_R,
        lora_alpha=LORA_ALPHA,
        lora_dropout=LORA_DROPOUT,
        target_modules=TARGET_MODULES,
        use_rslora=USE_RSLORA,
        bias="none",
        use_gradient_checkpointing="unsloth",  # Unsloth 최적화 체크포인팅
    )

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total = sum(p.numel() for p in model.parameters())
    print(f"    학습 파라미터: {trainable:,} / {total:,} ({trainable/total*100:.2f}%)")
    return model, tokenizer


# ── 2. 데이터셋 로드 + 포맷 변환 ────────────────────────────────────────────────

def load_instruction(config_path: str) -> str:
    with open(config_path, encoding="utf-8") as f:
        return json.load(f)["instruction"]


def load_jsonl(path: str) -> list:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    return records


def build_prompt(instruction: str, input_text: str, output_text: str = "") -> str:
    """Gemma 4 공식 chat template 형식으로 변환."""
    user_message = f"{instruction}\n\n{input_text}"
    prompt = (
        f"<start_of_turn>user\n{user_message}<end_of_turn>\n"
        f"<start_of_turn>model\n{output_text}"
    )
    if output_text:
        prompt += "<end_of_turn>"
    return prompt


def load_datasets(instruction: str):
    print("[2/5] 데이터셋 로드 및 포맷 변환")

    def convert(records):
        return [
            {"text": build_prompt(instruction, r["input"], r["output"])}
            for r in records
        ]

    train_records = load_jsonl(TRAIN_DATA_PATH)
    val_records = load_jsonl(VAL_DATA_PATH)

    train_ds = Dataset.from_list(convert(train_records))
    val_ds = Dataset.from_list(convert(val_records))

    print(f"    Train: {len(train_ds)}건 | Val: {len(val_ds)}건")
    return train_ds, val_ds


# ── 3. SFTTrainer 구성 + 학습 ─────────────────────────────────────────────────

def train(model, tokenizer, train_ds, val_ds):
    print("[3/5] SFTTrainer 구성")

    sft_config = SFTConfig(
        output_dir=OUTPUT_DIR,
        # 배치 / 최적화
        per_device_train_batch_size=PER_DEVICE_TRAIN_BATCH_SIZE,
        gradient_accumulation_steps=GRADIENT_ACCUMULATION_STEPS,
        num_train_epochs=NUM_TRAIN_EPOCHS,
        learning_rate=LEARNING_RATE,
        lr_scheduler_type=LR_SCHEDULER_TYPE,
        warmup_ratio=WARMUP_RATIO,
        optim=OPTIMIZER,
        weight_decay=WEIGHT_DECAY,
        # 정밀도
        fp16=FP16,
        bf16=BF16,
        # 메모리
        gradient_checkpointing=GRADIENT_CHECKPOINTING,
        gradient_checkpointing_kwargs=GRADIENT_CHECKPOINTING_KWARGS,
        # 시퀀스 길이
        max_seq_length=MAX_SEQ_LENGTH,
        dataset_text_field="text",
        packing=False,
        # 로깅 / 저장
        logging_steps=LOGGING_STEPS,
        eval_strategy=EVAL_STRATEGY,
        eval_steps=EVAL_STEPS,
        save_strategy=SAVE_STRATEGY,
        save_steps=SAVE_STEPS,
        save_total_limit=SAVE_TOTAL_LIMIT,
        load_best_model_at_end=LOAD_BEST_MODEL_AT_END,
        metric_for_best_model=METRIC_FOR_BEST_MODEL,
        run_name=WANDB_RUN_NAME,
        report_to=WANDB_REPORT_TO,
    )

    trainer = SFTTrainer(
        model=model,
        tokenizer=tokenizer,
        train_dataset=train_ds,
        eval_dataset=val_ds,
        args=sft_config,
    )

    print("[4/5] 학습 시작")
    trainer.train()
    return trainer


# ── 4. 저장 ───────────────────────────────────────────────────────────────────

def save(model, tokenizer, trainer):
    print(f"[5/5] 어댑터 저장: {OUTPUT_DIR}")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)

    # 학습 지표 요약 출력
    metrics = trainer.state.log_history
    train_losses = [m["loss"] for m in metrics if "loss" in m]
    eval_losses = [m["eval_loss"] for m in metrics if "eval_loss" in m]
    if train_losses:
        print(f"    최종 train loss: {train_losses[-1]:.4f}")
    if eval_losses:
        print(f"    최종 eval  loss: {eval_losses[-1]:.4f}")
    print("    완료!")


# ── 메인 ──────────────────────────────────────────────────────────────────────

def main():
    # WandB: Trainer의 WandbCallback이 init/log/finish를 자동 처리
    # 수동 wandb.init()을 쓰면 eval 메트릭이 누락되므로 env var로만 전달
    if WANDB_REPORT_TO == "wandb":
        os.environ["WANDB_PROJECT"] = WANDB_PROJECT
        os.environ["WANDB_NAME"]    = WANDB_RUN_NAME
        if WANDB_TEAM:
            os.environ["WANDB_ENTITY"] = WANDB_TEAM

    instruction = load_instruction(DATASET_CONFIG_PATH)
    model, tokenizer = load_model()
    train_ds, val_ds = load_datasets(instruction)
    trainer = train(model, tokenizer, train_ds, val_ds)
    save(model, tokenizer, trainer)


if __name__ == "__main__":
    main()
