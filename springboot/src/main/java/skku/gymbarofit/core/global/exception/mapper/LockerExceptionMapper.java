package skku.gymbarofit.core.global.exception.mapper;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.GlobalErrorCode;
import skku.gymbarofit.core.global.exception.GlobalException;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;

public class LockerExceptionMapper {

    private static BusinessException unknown() {
        return new GlobalException(GlobalErrorCode.UNKNOWN_ERROR);
    }

    public static BusinessException map(String constraintName) {
        if (constraintName == null || constraintName.isBlank()) return unknown();

        if (constraintName.contains("uk_locker_usage_gym_member_active")) {
            return new LockerException(LockerErrorCode.USER_ALREADY_HAS_LOCKER);
        }
        if (constraintName.contains("uk_locker_usage_locker_active")) {
            return new LockerException(LockerErrorCode.LOCKER_ALREADY_USED);
        }

        return unknown();
    }
}
