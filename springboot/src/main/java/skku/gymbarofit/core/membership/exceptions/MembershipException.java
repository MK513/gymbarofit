package skku.gymbarofit.core.membership.exceptions;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorCode;

public class MembershipException extends BusinessException {

    public MembershipException(ErrorCode errorCode) {
        super(errorCode);
    }
}
