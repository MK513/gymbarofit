package skku.gymbarofit.exception;

import io.jsonwebtoken.MalformedJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import skku.gymbarofit.dto.ResponseDto;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<?> handleBusinessException(BusinessException e) {
        return ResponseEntity
                .badRequest()
                .body(
                        new ResponseDto<Object>(HttpStatus.BAD_REQUEST, e.getErrorCode().getMessage()
                ));
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
