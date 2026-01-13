package skku.gymbarofit.api.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.locker.enums.LockerPayProcess;
import skku.gymbarofit.api.payment.MockPaymentService;
import skku.gymbarofit.core.item.locker.dto.*;
import skku.gymbarofit.core.payment.dto.RefundDecision;
import skku.gymbarofit.api.locker.exception.LockerExceptionMapper;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;
import skku.gymbarofit.core.item.locker.service.LockerInternalService;
import skku.gymbarofit.core.item.locker.service.LockerUsageInternalService;
import skku.gymbarofit.core.item.locker.service.LockerZoneInternalService;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.enums.PaymentTargetType;
import skku.gymbarofit.core.payment.service.PaymentInternalService;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

import java.util.List;
import java.util.Objects;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerService {

    private final LockerZoneInternalService lockerZoneInternalService;
    private final LockerInternalService lockerInternalService;
    private final LockerUsageInternalService lockerUsageInternalService;
    private final GymInternalService gymInternalService;
    private final MemberInternalService memberInternalService;
    private final PaymentInternalService paymentInternalService;
    private final MockPaymentService paymentService;

    @Transactional(readOnly = true)
    public ZoneListResponseDto getZoneList(Long gymId) {
        List<LockerZone> zones = lockerZoneInternalService.findAllByGymId(gymId);
        return ZoneListResponseDto.of(zones);
    }

    @Transactional(readOnly = true)
    public LockerListResponseDto getLockerList(Long zoneId) {

        List<Locker> lockers = lockerInternalService.findAllByZoneId(zoneId);
        List<LockerUsage> unavailableUsage = lockerUsageInternalService.findUnavailableByZoneId(zoneId);

        return LockerListResponseDto.from(lockers, unavailableUsage);
    }

    public Long reserve(Long memberId, LockerRentRequestDto request) {
        try {
            Member member = memberInternalService.findById(memberId);
            Locker locker = lockerInternalService.findById(request.lockerId());
            Gym gym = gymInternalService.findById(request.gymId());

            LockerUsage usage = lockerUsageInternalService.save(LockerUsage.from(member, locker, gym, request));
            Payment payment = paymentService.pend(Payment.from(member, request, usage));

            return payment.getId();

        } catch (DataIntegrityViolationException e) {
            throw LockerExceptionMapper.map(e);
        }
    }

    public void fail(Long paymentId, LockerPayProcess process) {
        Payment payment = paymentInternalService.findByIdForUpdate(paymentId);
        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(payment.getTargetId());

        if (!lockerUsage.isActive()) return;

        lockerUsage.cancel(process);
        payment.fail();
    }

    public void confirm(Long paymentId) {
        Payment payment = paymentInternalService.findByIdForUpdate(paymentId);
        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(payment.getTargetId());

        payment.pay();
        lockerUsage.confirm();
    }

    @Transactional(readOnly = true)
    public LockerRentResponseDto getDto(Long paymentId) {
        Payment payment = paymentInternalService.findById(paymentId);
        LockerUsage lockerUsage = lockerUsageInternalService.findById(payment.getTargetId());

        return LockerRentResponseDto.from(lockerUsage);
    }

    public RefundDecision beforeRefundTx(Long memberId, Long usageId) {

        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(usageId);

        if (!Objects.equals(lockerUsage.getMember().getId(), memberId)) {
            throw new LockerException(LockerErrorCode.UNAUTHORIZED_REFUND);
        }

        if (!lockerUsage.isActive()) {
            return RefundDecision.skip();
        }

        List<Payment> payments = paymentInternalService.findByTarget(usageId, PaymentTargetType.LOCKER_USAGE);
        return RefundDecision.doRefund(payments);
    }

    public void afterRefundTx(Long memberId, Long usageId) {

        LockerUsage lockerUsage = lockerUsageInternalService.findById(usageId);

        if (!Objects.equals(lockerUsage.getMember().getId(), memberId)) {
            throw new LockerException(LockerErrorCode.UNAUTHORIZED_REFUND);
        }

        if (!lockerUsage.isActive()) {
            return;
        }

        lockerUsage.cancel(LockerPayProcess.REFUND);
    }


    public Long beforeExtendTx(Long usageId, LockerExtendRequestDto request) {
        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(usageId);

        if (!lockerUsage.isActive()) {
            throw new LockerException(LockerErrorCode.INACTIVE_CANNOT_EXTEND);
        }

        lockerUsage.pending();

        Payment payment = paymentService.pend(Payment.from(lockerUsage.getMember(), request, lockerUsage));

        return payment.getId();
    }

    @Transactional(readOnly = true)
    public LockerRentResponseDto getLockerInfo(Long usageId) {
        return LockerRentResponseDto.from(lockerUsageInternalService.findById(usageId));
    }

    public void extend(Long paymentId, LockerExtendRequestDto request) {
        Payment payment = paymentInternalService.findByIdForUpdate(paymentId);
        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(payment.getTargetId());

        payment.pay();
        lockerUsage.extend(request.plan());
    }
}
