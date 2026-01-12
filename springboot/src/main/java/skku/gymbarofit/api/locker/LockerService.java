package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

@Transactional
@Service
@RequiredArgsConstructor
public class LockerService {

    private final LockerZoneInternalService lockerZoneInternalService;
    private final LockerInternalService lockerInternalService;
    private final LockerUsageInternalService lockerUsageInternalService;
    private final MockPaymentInternalService paymentInternalService;
    private final MemberInternalService memberInternalService;

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

    public LockerRentResponseDto rent(Long memberId, LockerRentRequestDto request) {

        if (lockerUsageInternalService.existsByGymIdAndMemberId(request.gymId(), memberId)) {
            throw new LockerException((LockerErrorCode.USER_ALREADY_HAS_LOCKER));
        }

        if (lockerUsageInternalService.existsByLockerId(request.lockerId())) {
            throw new LockerException(LockerErrorCode.LOCKER_ALREADY_USED);
        }

        Member member = memberInternalService.findById(memberId);
        Payment payment = paymentInternalService.pay(Payment.from(member, request));
        Locker locker = lockerInternalService.findById(request.lockerId());

        LockerUsage lockerUsage = lockerUsageInternalService.save(LockerUsage.from(member, payment, locker, request));

        return LockerRentResponseDto.from(lockerUsage);
    }
}
