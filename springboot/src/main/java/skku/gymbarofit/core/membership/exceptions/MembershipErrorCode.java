package skku.gymbarofit.core.membership.exceptions;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum MembershipErrorCode implements ErrorCode{

    MEMBERSHIP_ALREADY_EXISTS(HttpStatus.NOT_FOUND, "이미 등록된 멤버쉽입니다.");

    private final HttpStatus status;
    private final String message;
}
