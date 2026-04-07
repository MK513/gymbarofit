package skku.gymbarofit.core.payment.exception;

import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorCode;

public class PaymentException extends BusinessException {

    public PaymentException(ErrorCode errorCode) {
        super(errorCode);
    }
}
