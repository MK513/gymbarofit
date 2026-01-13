package skku.gymbarofit.api.locker.exception;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;

public class LockerExceptionMapper {

    public static RuntimeException map(DataIntegrityViolationException e) {

        Throwable cause = e.getCause();

        if (cause instanceof ConstraintViolationException cve) {
            String constraintName = cve.getConstraintName();

            if (constraintName == null || constraintName.isBlank()) {
                return new LockerException(LockerErrorCode.UNKNOWN_ERROR);
            }

            return switch (constraintName) {
                case "uk_gym_member_active" ->
                        new LockerException(LockerErrorCode.USER_ALREADY_HAS_LOCKER);
                case "uk_locker_active" ->
                        new LockerException(LockerErrorCode.LOCKER_ALREADY_USED);
                default ->
                        new LockerException(LockerErrorCode.UNKNOWN_ERROR);
            };
        }

        return new LockerException(LockerErrorCode.UNKNOWN_ERROR);
    }
}
