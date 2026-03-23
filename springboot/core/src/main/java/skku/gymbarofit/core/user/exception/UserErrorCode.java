package skku.gymbarofit.core.user.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    USER_ALREADY_EXIST(HttpStatus.CONFLICT ,"이미 사용중인 이메일입니다."),
    PASSWORD_DISMATCH(HttpStatus.UNAUTHORIZED ,"비밀번호가 일치하지 않습니다.");

    private final HttpStatus status;
    private final String message;
}
