package skku.gymbarofit.core.item.equipment.exception;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorCode;

public class EquipmentException extends BusinessException {
    public EquipmentException(ErrorCode errorCode) {
        super(errorCode);
    }
}
