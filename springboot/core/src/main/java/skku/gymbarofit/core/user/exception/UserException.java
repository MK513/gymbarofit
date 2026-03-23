package skku.gymbarofit.core.user.exception;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorCode;

public class UserException extends BusinessException {

    public UserException(ErrorCode errorCode) {
        super(errorCode);
    }
}
