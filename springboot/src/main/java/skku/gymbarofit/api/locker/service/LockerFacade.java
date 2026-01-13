package skku.gymbarofit.api.locker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.locker.enums.LockerPayProcess;
import skku.gymbarofit.api.payment.MockPaymentService;
import skku.gymbarofit.core.item.locker.dto.LockerExtendRequestDto;
import skku.gymbarofit.core.payment.dto.RefundDecision;
import skku.gymbarofit.core.item.locker.dto.LockerRentRequestDto;
import skku.gymbarofit.core.item.locker.dto.LockerRentResponseDto;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.service.PaymentInternalService;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public class LockerFacade {

    private final LockerService lockerService;
    private final MockPaymentService paymentService;

    public LockerRentResponseDto rent(Long memberId, LockerRentRequestDto request) {
        Long paymentId = lockerService.reserve(memberId, request);
        LockerPayProcess process = LockerPayProcess.RENT;

        try {
            paymentService.pay(paymentId);
        } catch (RuntimeException e) {
            lockerService.fail(paymentId, process);
            throw e;
        }

        try {
            lockerService.confirm(paymentId);
            return lockerService.getDto(paymentId);
        } catch (RuntimeException e) {
            try { paymentService.refund(paymentId); } catch (Exception ignore) {}
            lockerService.fail(paymentId, process);
            throw e;
        }
    }

    public void refund(Long memberId, Long usageId) {
        RefundDecision decision = lockerService.beforeRefundTx(memberId, usageId);

        if (!decision.shouldRefund()) return;

        long totalRefundAmount = decision.paymentIds().stream()
                .mapToLong(paymentService::refund) // 각 payment 환불 금액
                .sum();

        log.info("총 {}원 환불되었습니다", totalRefundAmount);

        lockerService.afterRefundTx(memberId, usageId);
    }

    public LockerRentResponseDto extend(Long usageId, LockerExtendRequestDto request) {
        Long paymentId = lockerService.beforeExtendTx(usageId, request);
        LockerPayProcess process = LockerPayProcess.EXTEND;

        Payment payment;
        try {
            paymentService.pay(paymentId);
        } catch (RuntimeException e) {
            lockerService.fail(paymentId, process);
            throw e;
        }

        try {
            lockerService.extend(paymentId, request);
            return lockerService.getDto(paymentId);
        } catch (RuntimeException e) {
            try {
                paymentService.refund(paymentId);
            } catch (Exception ignore) {}
            lockerService.fail(paymentId, process);
            throw e;
        }
    }
}
