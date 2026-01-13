package skku.gymbarofit.api.payment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.service.LockerUsageInternalService;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.service.PaymentInternalService;

import java.time.LocalDate;

@Transactional
@Service
@RequiredArgsConstructor
public class MockPaymentService {


    private final PaymentInternalService paymentInternalService;
    private final LockerUsageInternalService lockerUsageInternalService;

    public void pay(Long paymentId) {
        Payment payment = paymentInternalService.findById(paymentId);

        payment.pay();
    }

    public Long refund(Long paymentId) {
        Payment payment = paymentInternalService.findById(paymentId);
        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(payment.getTargetId());

        payment.refund();

        return calculateRefundAmount(payment.getAmount(), lockerUsage.getStartDate(), lockerUsage.getEndDate(), LocalDate.now());
    }

    public Payment pend(Payment payment) {
        return paymentInternalService.saveAndFlush(payment);
    }

    public static long calculateRefundAmount(long totalPaidAmount,
                                             LocalDate startDate,
                                             LocalDate endDate,
                                             LocalDate today) {
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate);
        if (totalDays <= 0) return 0;

        long remainingDays = java.time.temporal.ChronoUnit.DAYS.between(today, endDate);
        if (remainingDays < 0) remainingDays = 0;
        if (remainingDays > totalDays) remainingDays = totalDays;

        long proportional = (totalPaidAmount * remainingDays) / totalDays;
        return proportional / 2; // 50% 환불, 원 단위 내림
    }
}
