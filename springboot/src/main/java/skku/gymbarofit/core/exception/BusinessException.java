package skku.gymbarofit.core.exception;

import lombok.Getter;
import skku.gymbarofit.core.exception.code.ErrorCode;

@Getter
public abstract class BusinessException extends RuntimeException{

    private final ErrorCode errorCode;

    public BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}
