package skku.gymbarofit.core.item.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.item.locker.repository.LockerUsageRepository;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerUsageInternalService {
    private final LockerUsageRepository lockerUsageRepository;

    @Transactional(readOnly = true)
    public List<LockerUsage> findAllActiveByZoneId(Long zoneId) {
        return lockerUsageRepository.findAllByLocker_LockerZone_IdAndStatus(zoneId, LockerUsageStatus.ACTIVE);
    }
}
