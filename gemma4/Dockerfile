# syntax=docker/dockerfile:1

# ── 베이스 이미지 ──────────────────────────────────────────────────────────────
FROM nvidia/cuda:12.6.3-cudnn-devel-ubuntu22.04

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
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    python3.11 python3.11-dev python3-pip git curl \
    && ln -sf /usr/bin/python3.11 /usr/bin/python3 \
    && ln -sf /usr/bin/python3 /usr/bin/python

RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip setuptools wheel

# ── 2단계: unsloth (torch 버전을 unsloth이 결정하게 둠) ───────────────────────
# torchvision/torchaudio를 여기서 함께 설치하면 unsloth이 당기는 torch CUDA 버전과
# 엇갈릴 수 있으므로 별도 단계에서 설치한다.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install \
    unsloth_zoo \
    "unsloth @ git+https://github.com/unslothai/unsloth.git" \
    --extra-index-url https://download.pytorch.org/whl/cu126

# ── 2-b단계: torchvision/torchaudio/xformers ─────────────────────────────────
# unsloth이 설치한 torch CUDA 버전(cu126 또는 cu130 등)에 맞는 wheel을
# pip이 자동 선택하도록 cu126·cu130 인덱스를 모두 제공한다.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install \
    "torchvision>=0.26.0" \
    torchaudio \
    xformers \
    --extra-index-url https://download.pytorch.org/whl/cu126 \
    --extra-index-url https://download.pytorch.org/whl/cu130

# ── 3단계: Gemma 4 E2B 필수 패키지 ────────────────────────────────────────────
# transformers>=4.50.0: Gemma 4 (gemma4 아키텍처) 공식 지원 버전
# accelerate>=0.34.0: device_map='auto' 다중 GPU 분산 추론
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

# ── 4단계: bitsandbytes CUDA 재설치 ───────────────────────────────────────────
# CUDA_HOME/LD_LIBRARY_PATH가 설정된 상태에서 마지막에 단독 설치해야
# bitsandbytes가 /usr/local/cuda/lib64 의 CUDA 12.6 커널을 올바르게 링크함.
# unsloth(step 2)가 bitsandbytes를 먼저 설치하므로 --force-reinstall 필수.
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install "bitsandbytes>=0.44.0" --force-reinstall

# ── 5단계: 소스 복사 (자주 바뀜 → 최하단) ────────────────────────────────────
COPY config/  config/
COPY data/    data/
COPY utils/   utils/
COPY train.py main.py ./

RUN pip show unsloth unsloth_zoo torch transformers | grep -E "^Name|^Version"

EXPOSE 8000
CMD ["python", "main.py"]
