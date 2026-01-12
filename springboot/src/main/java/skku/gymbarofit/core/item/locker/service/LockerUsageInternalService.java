package skku.gymbarofit.core.item.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.item.locker.repository.LockerUsageRepository;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerUsageInternalService {
    private final LockerUsageRepository lockerUsageRepository;

    @Transactional(readOnly = true)
    public List<LockerUsage> findAllActiveByZoneId(Long zoneId) {
        return lockerUsageRepository.findAllByLocker_LockerZone_IdAndStatus(zoneId, LockerUsageStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public Boolean existsByLockerId(Long lockerId) {
        return lockerUsageRepository.existsByLocker_Id(lockerId);
    }

    public LockerUsage save(LockerUsage lockerUsage) {
        return lockerUsageRepository.save(lockerUsage);
    }

    @Transactional(readOnly = true)
    public Optional<LockerUsage> findByGymIdAndMemberId(Long gymId, Long memberId) {
        return lockerUsageRepository.findByGymIdAndMemberId(gymId, memberId);
    }

    @Transactional(readOnly = true)
    public Boolean existsByGymIdAndMemberId(Long gymId, Long memberId) {
        return lockerUsageRepository.existsByGymIdAndMemberId(gymId, memberId);
    }
}
