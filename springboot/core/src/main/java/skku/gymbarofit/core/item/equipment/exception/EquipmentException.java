package skku.gymbarofit.core.item.equipment.exception;

import lombok.Getter;
import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
public class EquipmentException extends BusinessException {

    private final Long equipmentId;
    private final Long equipmentUsageId;

    public EquipmentException(ErrorCode errorCode) {
        super(errorCode);
        this.equipmentId = null;
        this.equipmentUsageId = null;
    }

    public EquipmentException(ErrorCode errorCode, Long equipmentId, Long equipmentUsageId) {
        super(errorCode);
        this.equipmentId = equipmentId;
        this.equipmentUsageId = equipmentUsageId;
    }
}
