"""
GymBaroFit AI 트레이너 추론 서버

엔드포인트:
    GET  /health       — 헬스체크 (모델 로드 여부 포함)
    POST /analyze      — 회원 운동 데이터 분석 → 트레이너 피드백 반환

실행:
    python main.py
    # 또는
    uvicorn main:app --host 0.0.0.0 --port 8000
"""

# CUDA_LAUNCH_BLOCKING=1 은 디버깅 전용 (GPU 커널 직렬화로 ~10× 느려짐)
# 필요 시 환경변수로 외부 주입: CUDA_LAUNCH_BLOCKING=1 docker compose up

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from utils.inference import InferenceWorker


# ── 요청/응답 스키마 ───────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    input_text: str
    retrieved_context: str = ""


class AnalyzeResponse(BaseModel):
    feedback: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


# ── 앱 수명 주기 (startup/shutdown) ───────────────────────────────────────────

advisor: InferenceWorker | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global advisor
    print("모델 로딩 중...")
    try:
        advisor = InferenceWorker()
        print("모델 로드 완료. 서버 준비됨.")
    except FileNotFoundError as e:
        print(f"[WARN] 어댑터를 찾을 수 없습니다: {e}")
        print("[WARN] /analyze 는 503 을 반환합니다. train.py 실행 후 컨테이너를 재시작하세요.")
    except Exception as e:
        import traceback
        print(f"[ERROR] 모델 로드 실패:\n{traceback.format_exc()}")
        print("[WARN] 서버는 계속 실행되지만 /analyze 는 503 을 반환합니다.")
    yield
    if advisor is not None:
        advisor.shutdown()


# ── FastAPI 앱 ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="GymBaroFit AI 트레이너",
    description="Gemma 4 LoRA 기반 개인 맞춤형 운동 피드백 API",
    version="1.0.0",
    lifespan=lifespan,
)


# ── 검증 에러 로깅 ────────────────────────────────────────────────────────────

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"[422] 검증 실패 — body: {body.decode('utf-8', errors='replace')}")
    print(f"[422] errors: {exc.errors()}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


# ── 라우트 ────────────────────────────────────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", model_loaded=advisor is not None)


@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    if advisor is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="모델 로딩 중입니다. 잠시 후 다시 시도하세요.",
        )

    def event_stream():
        try:
            for token in advisor.stream_analyze(req.input_text, req.retrieved_context):
                yield f"data: {json.dumps({'token': token}, ensure_ascii=False)}\n\n"
        except RuntimeError as e:
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # nginx 버퍼링 비활성화
        },
    )


# ── 직접 실행 ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
