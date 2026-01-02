package skku.gymbarofit.core.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("존재하지 않는 사용자입니다."),
    PASSWORD_DISMATCH("비밀번호가 일치하지 않습니다."),
    DUPLICATED_EMAIL_USED("이미 사용중인 이메일입니다.");

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }
}
