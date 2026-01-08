package skku.gymbarofit.core.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("BusinessException Occurred: {}", e.getErrorCode().getMessage()); // warn 레벨 추천
        return ErrorResponse.toResponseEntity(e.getErrorCode());
    }

    @ExceptionHandler(Exception.class) // ✅ 모든 예외 처리
    public ResponseEntity<?> handleAll(Exception e) {

        log.error("Unhandled Exception: ", e);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "status", 500,
                        "error", "INTERNAL_SERVER_ERROR",
                        "message", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."
                ));
    }
}
