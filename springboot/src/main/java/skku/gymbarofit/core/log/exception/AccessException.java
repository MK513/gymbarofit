package skku.gymbarofit.core.log.exception;

import skku.gymbarofit.core.global.exception.BusinessException;

public class AccessException extends BusinessException {

    public AccessException(AccessErrorCode errorCode) {
        super(errorCode);
    }
}
