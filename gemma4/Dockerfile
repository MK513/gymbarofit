# syntax=docker/dockerfile:1

# ── 베이스 이미지 ──────────────────────────────────────────────────────────────
# pytorch 공식 이미지: torch + torchvision + torchaudio가 동일한 CUDA 12.6 빌드로 패키징됨
# → pip install torch를 다시 실행하지 않으므로 CUDA 버전 불일치 구조적 방지
FROM pytorch/pytorch:2.7.0-cuda12.6-cudnn9-devel

# ── 환경 변수 ──────────────────────────────────────────────────────────────────
ENV DEBIAN_FRONTEND=noninteractive \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    HF_HOME=/app/.cache/huggingface \
    TORCH_HOME=/app/.cache/torch \
    CUDA_HOME=/usr/local/cuda \
    PATH=/usr/local/cuda/bin:$PATH \
    LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH

WORKDIR /app

# ── 1단계: 시스템 패키지 ───────────────────────────────────────────────────────
# python/pip은 베이스 이미지에 이미 포함 → git, curl만 추가 설치
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    git curl \
    && rm -rf /var/lib/apt/lists/*

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip setuptools wheel

# ── 2단계: unsloth 설치 (torch 버전 동결) ─────────────────────────────────────
# constraint 파일로 torch 버전을 고정 → --no-deps 없이 unsloth 의존성을 정상 설치하면서
# torch만 업그레이드되지 않도록 막는다.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install unsloth_zoo && \
    TORCH_VER=$(python -c "import torch; print(torch.__version__)") && \
    echo "torch==${TORCH_VER}" > /tmp/torch_constraint.txt && \
    pip install \
        "unsloth @ git+https://github.com/unslothai/unsloth.git" \
        -c /tmp/torch_constraint.txt \
        --upgrade-strategy only-if-needed

# ── 3단계: xformers (unsloth 최적화 어텐션 필수) ───────────────────────────────
# xformers 없으면 unsloth가 느린 fallback attention 사용 → 생성 타임아웃 원인
# cu126 인덱스에서 설치하되 torch는 constraint로 고정
RUN --mount=type=cache,target=/root/.cache/pip \
    TORCH_VER=$(python -c "import torch; print(torch.__version__)") && \
    echo "torch==${TORCH_VER}" > /tmp/torch_constraint.txt && \
    pip install xformers \
        -c /tmp/torch_constraint.txt \
        --index-url https://download.pytorch.org/whl/cu126

# ── 4단계: Gemma 4 관련 및 기타 필수 패키지 ────────────────────────────────────
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install \
    "transformers>=4.50.0" \
    "trl>=0.11.0" \
    "peft>=0.13.0" \
    "datasets>=3.0.0" \
    "accelerate>=0.34.0" \
    "pyyaml>=6.0" \
    "wandb>=0.18.0" \
    "fastapi>=0.115.0" \
    "uvicorn[standard]>=0.30.0"

# ── 5단계: bitsandbytes 설치 ──────────────────────────────────────────────────
# torch가 이미 설치된 상태에서 pip는 호환 버전 재설치를 시도하지 않음
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install "bitsandbytes>=0.44.0"

# ── 6단계: 소스 복사 (자주 바뀜 → 최하단) ────────────────────────────────────
COPY config/  config/
COPY data/    data/
COPY utils/   utils/
COPY train.py main.py ./

RUN pip show unsloth unsloth_zoo torch transformers | grep -E "^Name|^Version"

EXPOSE 8000
CMD ["python", "main.py"]
