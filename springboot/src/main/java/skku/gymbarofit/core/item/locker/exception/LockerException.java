package skku.gymbarofit.core.item.locker.exception;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorCode;

public class LockerException extends BusinessException {

    public LockerException(ErrorCode errorCode) {
        super(errorCode);
    }
}
