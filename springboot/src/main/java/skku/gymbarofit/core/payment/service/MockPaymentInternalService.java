package skku.gymbarofit.core.payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.exception.PaymentErrorCode;
import skku.gymbarofit.core.payment.exception.PaymentException;
import skku.gymbarofit.core.payment.repository.PaymentRepository;

@Transactional
@Service
@RequiredArgsConstructor
public class MockPaymentInternalService {

    private final PaymentRepository paymentRepository;

    public Payment pay(Payment payment) {
        return paymentRepository.save(payment);
    }

    public void refund(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentException(PaymentErrorCode.PAYMENT_NOT_FOUND));

        payment.refund();
    }
}
