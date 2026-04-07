package skku.gymbarofit.core.item.equipment.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum EquipmentErrorCode implements ErrorCode {

    EQUIPMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 기구입니다"),
    EQUIPMENT_USAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 기구 사용입니다"),
    STATUS_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 존재하는 기구 상태입니다"),
    INVALID_USAGE_STATUS(HttpStatus.CONFLICT, "현재 상태에서 해당 작업을 수행할 수 없습니다");

    private final HttpStatus status;
    private final String message;
}
