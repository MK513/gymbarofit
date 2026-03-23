package skku.gymbarofit.api.global.exception.mapper;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.GlobalErrorCode;
import skku.gymbarofit.core.global.exception.GlobalException;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;

public class EquipmentExceptionMapper {

    private static BusinessException unknown() {
        return new GlobalException(GlobalErrorCode.UNKNOWN_ERROR);
    }

    public static BusinessException map(String constraintName) {
        if (constraintName == null || constraintName.isBlank()) return unknown();

        // H2에서 uk_equipment_usage_member_status_index_b 처럼 suffix가 붙을 수 있어서 contains로 처리
        if (constraintName.contains("uk_equipment_usage_member_status")) {
            return new EquipmentException(EquipmentErrorCode.STATUS_ALREADY_EXISTS);
        }

        return unknown();
    }
}
