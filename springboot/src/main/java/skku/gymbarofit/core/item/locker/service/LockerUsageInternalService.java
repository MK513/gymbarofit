package skku.gymbarofit.core.item.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;
import skku.gymbarofit.core.item.locker.repository.LockerUsageRepository;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerUsageInternalService {
    private final LockerUsageRepository lockerUsageRepository;

    @Transactional(readOnly = true)
    public List<LockerUsage> findUnavailableByZoneId(Long zoneId) {
        return lockerUsageRepository.findAllByLocker_LockerZone_IdAndStatusIn(
                zoneId,
                List.of(
                        LockerUsageStatus.ACTIVE,
                        LockerUsageStatus.PENDING
                )
        );
    }

    @Transactional(readOnly = true)
    public Boolean existsByLockerId(Long lockerId) {
        return lockerUsageRepository.existsByLocker_Id(lockerId);
    }

    public LockerUsage save(LockerUsage lockerUsage) {
        return lockerUsageRepository.saveAndFlush(lockerUsage);
    }

    @Transactional(readOnly = true)
    public Optional<LockerUsage> findActiveByGymIdAndMemberId(Long gymId, Long memberId) {
        return lockerUsageRepository.findActiveByGymIdAndMemberId(gymId, memberId);
    }

    @Transactional(readOnly = true)
    public Boolean existsByGymIdAndMemberId(Long gymId, Long memberId) {
        return lockerUsageRepository.existsByGymIdAndMemberId(gymId, memberId);
    }

    @Transactional(readOnly = true)
    public LockerUsage findById(Long usageId) {
        return lockerUsageRepository.findById(usageId)
                .orElseThrow(() -> new LockerException(LockerErrorCode.USAGE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public LockerUsage findActiveByIdForUpdate(Long usageId) {
        return lockerUsageRepository.findActiveByIdForUpdate(usageId)
                .orElseThrow(() -> new LockerException(LockerErrorCode.USAGE_NOT_FOUND));
    }
}
