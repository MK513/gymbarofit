package skku.gymbarofit.core.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.Objects;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<?> handleBusinessException(BusinessException e) {

        log.error(e.getErrorCode().getMessage());
        return ResponseEntity
                .badRequest()
                .body(
//                        new ResponseDto<Object>(HttpStatus.BAD_REQUEST, e.getErrorCode().getMessage()
                        new ResponseEntity<Object>(HttpStatus.BAD_REQUEST)
                );
    }

    @ExceptionHandler(Exception.class) // ✅ 모든 예외 처리
    public ResponseEntity<?> handleAll(Exception e) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                        "error", "ServerError",
                        "message", e.getMessage()));
    }
}
