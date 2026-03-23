package skku.gymbarofit.api.security.exception;

import skku.gymbarofit.api.security.exception.code.SecurityErrorCode;
import skku.gymbarofit.core.global.exception.BusinessException;

public class RefreshTokenException extends BusinessException {

    public RefreshTokenException(SecurityErrorCode errorCode) {
        super(errorCode);
    }
}
