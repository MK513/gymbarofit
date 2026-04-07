package skku.gymbarofit.core.log.exception;

import lombok.Getter;
import skku.gymbarofit.core.global.exception.BusinessException;

@Getter
public class AccessException extends BusinessException {

    private final Long memberId;

    public AccessException(AccessErrorCode errorCode) {
        super(errorCode);
        this.memberId = null;
    }

    public AccessException(AccessErrorCode errorCode, Long memberId) {
        super(errorCode);
        this.memberId = memberId;
    }
}
