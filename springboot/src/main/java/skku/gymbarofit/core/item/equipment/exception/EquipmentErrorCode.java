package skku.gymbarofit.core.item.equipment.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum EquipmentErrorCode implements ErrorCode {

    EQUIPMENT_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 기구입니다"),
    STATUS_ALREADY_EXISTS(HttpStatus.CONFLICT, "이미 존재하는 기구 상태입니다");

    private final HttpStatus status;
    private final String message;
}
