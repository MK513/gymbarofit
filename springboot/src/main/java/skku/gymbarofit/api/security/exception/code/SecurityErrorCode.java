package skku.gymbarofit.api.security.exception.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.exception.code.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum SecurityErrorCode implements ErrorCode {

    JWT_TIMEOUT(HttpStatus.UNAUTHORIZED, "유효 기간이 초과된 토큰입니다.");

    private final HttpStatus status;
    private final String message;
}