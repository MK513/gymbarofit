package skku.gymbarofit.api.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.usage.locker.enums.LockerPayProcess;
import skku.gymbarofit.api.payment.MockPaymentService;
import skku.gymbarofit.api.user.owner.dto.LockerZoneCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneSummaryDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneUpdateRequestDto;
import skku.gymbarofit.core.item.enums.ItemStatus;
import skku.gymbarofit.core.item.enums.SizeStatus;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.dto.*;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;
import skku.gymbarofit.core.item.locker.repository.LockerRepository;
import skku.gymbarofit.core.item.locker.repository.LockerZoneRepository;
import skku.gymbarofit.core.item.locker.service.LockerInternalService;
import skku.gymbarofit.core.item.locker.service.LockerZoneInternalService;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.dto.RefundDecision;
import skku.gymbarofit.core.payment.enums.PaymentTargetType;
import skku.gymbarofit.core.payment.service.PaymentInternalService;
import skku.gymbarofit.api.global.exception.mapper.LockerExceptionMapper;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.usage.locker.LockerUsage;
import skku.gymbarofit.core.usage.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.usage.locker.repository.LockerUsageRepository;
import skku.gymbarofit.core.usage.locker.service.LockerUsageInternalService;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

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
    private final LockerZoneRepository lockerZoneRepository;
    private final LockerRepository lockerRepository;
    private final LockerUsageRepository lockerUsageRepository;

    // ─── 회원용 ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ZoneListResponseDto getZoneList(Long gymId) {
        List<LockerZone> zones = lockerZoneInternalService.findAllByGymId(gymId);
        return ZoneListResponseDto.of(zones);
    }

    @Transactional(readOnly = true)
    public LockerListResponseDto getLockerList(Long zoneId) {

        List<Locker> lockers = lockerInternalService.findAllByZoneId(zoneId);
        List<LockerUsage> unavailableUsage = lockerUsageInternalService.findUnavailableByZoneId(zoneId);

        Map<Long, LockerUsageStatus> usageStatusMap = unavailableUsage.stream()
                .collect(Collectors.toMap(
                        u -> u.getLocker().getId(),
                        LockerUsage::getStatus
                ));

        List<LockerResponseDto> listDto = lockers.stream()
                .map(l -> LockerResponseDto.of(l, usageStatusMap.get(l.getId())))
                .toList();

        long availableCount = lockers.stream()
                .filter(l -> isAvailable(l, usageStatusMap.get(l.getId())))
                .count();
        long unavailableCount = lockers.size() - availableCount;

        return LockerListResponseDto.of(availableCount, unavailableCount, listDto);
    }

    private boolean isAvailable(Locker locker, LockerUsageStatus usageStatus) {
        ItemStatus itemStatus = locker.getItemInfo().getStatus();
        return usageStatus == null && itemStatus == ItemStatus.OK;
    }

    public Long reserve(Long memberId, LockerRentRequestDto request) {
        Member member = memberInternalService.findById(memberId);
        Locker locker = lockerInternalService.findById(request.lockerId());
        Gym gym = gymInternalService.findById(request.gymId());

        LockerUsage usage = lockerUsageInternalService.save(LockerUsage.from(member, locker, gym, request));
        Payment payment = paymentService.pend(Payment.from(member, request, usage));

        return payment.getId();
    }

    public void fail(Long paymentId) {
        Payment payment = paymentInternalService.findByIdForUpdate(paymentId);
        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(payment.getTargetId());

        if (!lockerUsage.isActive()) return;

        lockerUsage.cancel();
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

        lockerUsage.cancel();
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

    public LockerResponseDto updateLockerStatus(Long ownerId, Long lockerId, LockerStatusUpdateRequestDto dto) {
        Locker locker = lockerInternalService.findById(lockerId);

        Long gymOwnerId = locker.getLockerZone().getGym().getOwner().getId();
        if (!gymOwnerId.equals(ownerId)) {
            throw new LockerException(LockerErrorCode.LOCKER_NOT_FOUND);
        }

        locker.updateStatus(ItemStatus.valueOf(dto.status()));

        Long zoneId = locker.getLockerZone().getId();
        LockerUsageStatus usageStatus = lockerUsageInternalService.findUnavailableByZoneId(zoneId)
                .stream()
                .filter(u -> u.getLocker().getId().equals(lockerId))
                .map(LockerUsage::getStatus)
                .findFirst()
                .orElse(null);

        return LockerResponseDto.of(locker, usageStatus);
    }

    public void extend(Long paymentId, LockerExtendRequestDto request) {
        Payment payment = paymentInternalService.findByIdForUpdate(paymentId);
        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByIdForUpdate(payment.getTargetId());

        payment.pay();
        lockerUsage.extend(request.plan());
    }

    // ─── 오너용 LockerZone 관리 ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<LockerZoneSummaryDto> getLockerZonesForOwner(Long gymId) {
        gymInternalService.findById(gymId);
        return lockerZoneRepository.findAllByGym_Id(gymId).stream()
                .map(zone -> {
                    int rentedCount = lockerUsageRepository
                            .findAllByLocker_LockerZone_IdAndStatusIn(zone.getId(), List.of(LockerUsageStatus.ACTIVE))
                            .size();
                    return LockerZoneSummaryDto.of(zone, rentedCount);
                })
                .toList();
    }

    public void addLockerZone(Long ownerId, LockerZoneCreateRequestDto dto) {
        Gym gym = gymInternalService.findById(dto.gymId());
        SizeStatus size = SizeStatus.valueOf(dto.size());
        String zoneName = (dto.name() != null && !dto.name().isBlank())
                ? dto.name()
                : switch (size) {
                    case SMALL  -> "소형 보관함";
                    case MEDIUM -> "중형 보관함";
                    case LARGE  -> "대형 보관함";
                };
        LockerZone zone = LockerZone.create(gym, zoneName, size, dto.rowCount(), dto.columnCount());
        lockerZoneRepository.save(zone);
        int total = dto.rowCount() * dto.columnCount();
        List<Locker> lockers = IntStream.rangeClosed(1, total)
                .mapToObj(i -> Locker.create(zone, i))
                .toList();
        lockerRepository.saveAll(lockers);
    }

    public LockerZoneSummaryDto updateLockerZone(Long ownerId, Long zoneId, LockerZoneUpdateRequestDto dto) {
        LockerZone zone = lockerZoneRepository.findById(zoneId)
                .orElseThrow(() -> new LockerException(LockerErrorCode.ZONE_NOT_FOUND));
        int oldTotal = zone.getTotalCount();
        int newTotal = dto.rowCount() * dto.columnCount();
        zone.update(dto.name(), SizeStatus.valueOf(dto.size()), dto.rowCount(), dto.columnCount());
        if (newTotal > oldTotal) {
            List<Locker> newLockers = IntStream.rangeClosed(oldTotal + 1, newTotal)
                    .mapToObj(i -> Locker.create(zone, i))
                    .toList();
            lockerRepository.saveAll(newLockers);
        } else if (newTotal < oldTotal) {
            List<LockerUsage> activeInExcess = lockerUsageRepository
                    .findAllByLocker_LockerZone_IdAndStatusIn(zoneId, List.of(LockerUsageStatus.ACTIVE))
                    .stream()
                    .filter(u -> u.getLocker().getLockerNumber() > newTotal)
                    .toList();
            if (!activeInExcess.isEmpty()) {
                throw new LockerException(LockerErrorCode.LOCKER_ALREADY_USED);
            }
            List<Locker> excessLockers = lockerRepository.findAllByLockerZoneId(zoneId).stream()
                    .filter(l -> l.getLockerNumber() > newTotal)
                    .toList();
            lockerRepository.deleteAll(excessLockers);
        }
        int rentedCount = lockerUsageRepository
                .findAllByLocker_LockerZone_IdAndStatusIn(zoneId, List.of(LockerUsageStatus.ACTIVE))
                .size();
        return LockerZoneSummaryDto.of(zone, rentedCount);
    }

    public void deleteLockerZone(Long ownerId, Long zoneId) {
        LockerZone zone = lockerZoneRepository.findById(zoneId)
                .orElseThrow(() -> new LockerException(LockerErrorCode.ZONE_NOT_FOUND));
        boolean hasActiveRentals = !lockerUsageRepository
                .findAllByLocker_LockerZone_IdAndStatusIn(zoneId, List.of(LockerUsageStatus.ACTIVE))
                .isEmpty();
        if (hasActiveRentals) {
            throw new LockerException(LockerErrorCode.LOCKER_ALREADY_USED);
        }
        lockerRepository.deleteAll(lockerRepository.findAllByLockerZoneId(zoneId));
        lockerZoneRepository.delete(zone);
    }
}
