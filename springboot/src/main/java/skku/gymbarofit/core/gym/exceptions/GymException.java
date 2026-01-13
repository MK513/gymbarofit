package skku.gymbarofit.core.gym.exceptions;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorCode;

public class GymException extends BusinessException {

    public GymException(ErrorCode errorCode) {
        super(errorCode);
    }
}
