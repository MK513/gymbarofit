package skku.gymbarofit.api.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.payment.dto.RefundDecision;
import skku.gymbarofit.api.locker.exception.LockerExceptionMapper;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.dto.LockerListResponseDto;
import skku.gymbarofit.core.item.locker.dto.LockerRentRequestDto;
import skku.gymbarofit.core.item.locker.dto.LockerRentResponseDto;
import skku.gymbarofit.core.item.locker.dto.ZoneListResponseDto;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;
import skku.gymbarofit.core.item.locker.service.LockerInternalService;
import skku.gymbarofit.core.item.locker.service.LockerUsageInternalService;
import skku.gymbarofit.core.item.locker.service.LockerZoneInternalService;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.service.MockPaymentInternalService;
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
    private final MockPaymentInternalService paymentInternalService;
    private final MemberInternalService memberInternalService;
    private final GymInternalService gymInternalService;

    @Transactional(readOnly = true)
    public ZoneListResponseDto getZoneList(Long gymId) {
        List<LockerZone> zones = lockerZoneInternalService.findAllByGymId(gymId);
        return ZoneListResponseDto.of(zones);
    }

    @Transactional(readOnly = true)
    public LockerListResponseDto getLockerList(Long zoneId) {

        List<Locker> lockers = lockerInternalService.findAllByZoneId(zoneId);
        List<LockerUsage> usages = lockerUsageInternalService.findAllActiveByZoneId(zoneId);

        return LockerListResponseDto.of(lockers, usages);
    }

    public Long reserve(Member member, LockerRentRequestDto request) {
        try {
            Locker locker = lockerInternalService.findById(request.lockerId());
            Gym gym = gymInternalService.findById(request.gymId());

            LockerUsage usage = lockerUsageInternalService.saveAndFlush(
                    LockerUsage.from(member, locker, gym, request)
            );

            return usage.getId();

        } catch (DataIntegrityViolationException e) {
            throw LockerExceptionMapper.map(e);
        }
    }

    public void cancel(Long usageId) {
        LockerUsage usage = lockerUsageInternalService.findActiveByIdForUpdate(usageId);

        if (!usage.isActive()) return;

        usage.cancel();
    }

    public void confirm(Long usageId, Payment payment) {
        lockerUsageInternalService.findActiveByIdForUpdate(usageId).confirm(payment);
    }

    @Transactional(readOnly = true)
    public LockerRentResponseDto getDto(Long usageId) {
        return LockerRentResponseDto.from(lockerUsageInternalService.findById(usageId));
    }

    public RefundDecision beforeRefundTx(Long memberId, Long usageId) {

        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(usageId);

        if (!Objects.equals(lockerUsage.getMember().getId(), memberId)) {
            throw new LockerException(LockerErrorCode.UNAUTHORIZED_REFUND);
        }

        if (!lockerUsage.isActive()) {
            return RefundDecision.skip();
        }

        return RefundDecision.doRefund(lockerUsage.getPayment().getId());
    }

    public void afterRefundTx(Long memberId, Long usageId) {

        LockerUsage lockerUsage = lockerUsageInternalService.findById(usageId);

        if (!Objects.equals(lockerUsage.getMember().getId(), memberId)) {
            throw new LockerException(LockerErrorCode.UNAUTHORIZED_REFUND);
        }

        if (!lockerUsage.isActive()) {
            return;
        }

        lockerUsage.cancel();
    }


}
