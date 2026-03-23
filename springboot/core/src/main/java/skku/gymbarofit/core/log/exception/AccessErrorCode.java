package skku.gymbarofit.core.log.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum AccessErrorCode implements ErrorCode {

    ALREADY_CHECKED_IN(HttpStatus.CONFLICT, "이미 체크인 중입니다."),
    NOT_CHECKED_IN(HttpStatus.BAD_REQUEST, "체크인 기록이 없습니다.");

    private final HttpStatus status;
    private final String message;
}
