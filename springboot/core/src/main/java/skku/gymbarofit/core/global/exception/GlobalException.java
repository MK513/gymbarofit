package skku.gymbarofit.core.global.exception;

public class GlobalException extends BusinessException {

    public GlobalException(ErrorCode errorCode) {
        super(errorCode);
    }
}
