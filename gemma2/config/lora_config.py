"""
Gemma 2 9B SFT 학습 하이퍼파라미터 설정
대상 GPU: Google Colab T4 (16GB VRAM)
"""

# ── 모델 ──────────────────────────────────────────────────────────────────────
MODEL_NAME = "unsloth/gemma-2-9b-it-bnb-4bit"
MAX_SEQ_LENGTH = 2048          # T4에서 안정적인 최대 시퀀스 길이

# ── LoRA ──────────────────────────────────────────────────────────────────────
LORA_R = 16                    # rank: 표현력과 메모리의 균형점
LORA_ALPHA = 16                # scaling = alpha / r → 1.0 (변경 없음)
LORA_DROPOUT = 0.05
TARGET_MODULES = [             # Gemma 2 attention + MLP 전체 적용
    "q_proj", "k_proj", "v_proj", "o_proj",
    "gate_proj", "up_proj", "down_proj",
]
USE_RSLORA = False             # True 시 rank-stabilized LoRA (실험적)

# ── 학습 ──────────────────────────────────────────────────────────────────────
OUTPUT_DIR = "models/gemma2-fitness-lora"

PER_DEVICE_TRAIN_BATCH_SIZE = 2
GRADIENT_ACCUMULATION_STEPS = 4   # 유효 배치 크기 = 2 × 4 = 8
NUM_TRAIN_EPOCHS = 2

LEARNING_RATE = 2e-4
LR_SCHEDULER_TYPE = "cosine"
WARMUP_RATIO = 0.03

OPTIMIZER = "adamw_8bit"       # bitsandbytes 8-bit optimizer → VRAM 절약
WEIGHT_DECAY = 0.01

# ── 정밀도 ────────────────────────────────────────────────────────────────────
FP16 = True                    # T4는 fp16 지원 (bf16 미지원)
BF16 = False

# ── 메모리 최적화 ──────────────────────────────────────────────────────────────
GRADIENT_CHECKPOINTING = True  # 활성화 재계산으로 VRAM ↓ (속도 소폭 ↓)
GRADIENT_CHECKPOINTING_KWARGS = {"use_reentrant": False}

# ── 로깅 / 저장 ───────────────────────────────────────────────────────────────
LOGGING_STEPS = 10
EVAL_STRATEGY = "steps"
EVAL_STEPS = 50
SAVE_STRATEGY = "steps"
SAVE_STEPS = 50
SAVE_TOTAL_LIMIT = 2           # 최근 2개 체크포인트만 유지
LOAD_BEST_MODEL_AT_END = True
METRIC_FOR_BEST_MODEL = "eval_loss"

# ── 데이터 경로 ───────────────────────────────────────────────────────────────
TRAIN_DATA_PATH = "data/train.jsonl"
VAL_DATA_PATH = "data/val.jsonl"
DATASET_CONFIG_PATH = "data/dataset_config.json"
