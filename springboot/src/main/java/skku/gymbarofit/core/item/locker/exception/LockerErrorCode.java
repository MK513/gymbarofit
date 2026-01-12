package skku.gymbarofit.core.item.locker.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum LockerErrorCode implements ErrorCode{

    LOCKER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 보관함입니다"),
    LOCKER_ALREADY_USED(HttpStatus.CONFLICT, "이미 사용 중인 보관함입니다"),
    ZONE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 구역입니다"),
    ZONE_NOT_EXISTS(HttpStatus.NOT_FOUND, "구역이 존재하지 않습니다"),
    USER_ALREADY_HAS_LOCKER(HttpStatus.CONFLICT, "이미 사용 중인 보관함이 있어 새로운 보관함을 사용할 수 없습니다"
    );

    private final HttpStatus status;
    private final String message;
}
