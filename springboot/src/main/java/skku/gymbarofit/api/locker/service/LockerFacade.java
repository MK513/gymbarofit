package skku.gymbarofit.api.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.payment.dto.RefundDecision;
import skku.gymbarofit.core.item.locker.dto.LockerRentRequestDto;
import skku.gymbarofit.core.item.locker.dto.LockerRentResponseDto;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.service.MockPaymentInternalService;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

@Service
@RequiredArgsConstructor
public class LockerFacade {

    private final LockerService lockerService;
    private final MockPaymentInternalService paymentInternalService;
    private final MemberInternalService memberInternalService;

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public LockerRentResponseDto rent(Long memberId, LockerRentRequestDto request) {
        Member member = memberInternalService.findById(memberId);
        Long usageId = lockerService.reserve(member, request);

        Payment payment;
        try {
            payment = paymentInternalService.pay(Payment.from(member, request));
        } catch (RuntimeException e) {
            lockerService.cancel(usageId);
            throw e;
        }

        try {
            lockerService.confirm(usageId, payment);
            return lockerService.getDto(usageId);
        } catch (RuntimeException e) {
            try { paymentInternalService.refund(payment.getId()); } catch (Exception ignore) {}
            lockerService.cancel(usageId);
            throw e;
        }
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void refund(Long memberId, Long usageId) {
        RefundDecision decision = lockerService.beforeRefundTx(memberId, usageId);

        if (!decision.shouldRefund()) return;

        paymentInternalService.refund(decision.paymentId());

        lockerService.afterRefundTx(memberId, usageId);
    }
}
