package skku.gymbarofit.core.payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.enums.PaymentTargetType;
import skku.gymbarofit.core.payment.exception.PaymentErrorCode;
import skku.gymbarofit.core.payment.exception.PaymentException;
import skku.gymbarofit.core.payment.repository.PaymentRepository;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class PaymentInternalService {

    //TODO Internal 이랑 service 쪼개기

    private final PaymentRepository paymentRepository;

    public Payment saveAndFlush(Payment payment) {
        return paymentRepository.saveAndFlush(payment);
    }

    @Transactional(readOnly = true)
    public Payment findById(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentException(PaymentErrorCode.PAYMENT_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public Payment findByIdForUpdate(Long paymentId) {
        return paymentRepository.findByIdForUpdate(paymentId)
                .orElseThrow(() -> new PaymentException(PaymentErrorCode.PAYMENT_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public List<Payment> findByTarget(Long targetId, PaymentTargetType paymentTargetType) {
        return paymentRepository.findByTarget(targetId, paymentTargetType);
    }
}
