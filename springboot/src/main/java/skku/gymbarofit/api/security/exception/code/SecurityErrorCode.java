package skku.gymbarofit.api.security.exception.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.exception.code.ErrorCode;

@Getter
@RequiredArgsConstructor
public class SecurityErrorCode implements ErrorCode {

    private final HttpStatus status;
    private final String message;
}
