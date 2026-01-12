package skku.gymbarofit.core.item.locker.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum LockerErrorCode implements ErrorCode{

    LOCKER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 보관함입니다"),
    ZONE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 구역입니다"),
    USAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 대여 이력입니다"),
    LOCKER_ALREADY_USED(HttpStatus.CONFLICT, "이미 사용 중인 보관함입니다"),
    USER_ALREADY_HAS_LOCKER(HttpStatus.CONFLICT, "이미 사용 중인 보관함이 있어 새로운 보관함을 사용할 수 없습니다"),
    USAGE_NOT_ACTIVE(HttpStatus.CONFLICT, "유효하지 않은 대여 상태입니다"),
    UNKNOWN_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "알 수 없는 에러가 발생했습니다"),
    UNAUTHORIZED_REFUND(HttpStatus.FORBIDDEN, "권한이 없는 환불 요청입니다"),
    PROCESSED_REFUND(HttpStatus.CONFLICT, "이미 처리된 환불 요청입니다");

    private final HttpStatus status;
    private final String message;
}
