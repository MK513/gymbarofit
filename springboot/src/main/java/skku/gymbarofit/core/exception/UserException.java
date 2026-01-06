package skku.gymbarofit.core.exception;

import skku.gymbarofit.core.exception.code.ErrorCode;

public class UserException extends BusinessException{

    public UserException(ErrorCode errorCode) {
        super(errorCode);
    }
}
