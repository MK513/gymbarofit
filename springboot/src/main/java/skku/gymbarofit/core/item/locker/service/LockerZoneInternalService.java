package skku.gymbarofit.core.item.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;
import skku.gymbarofit.core.item.locker.repository.LockerZoneRepository;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerZoneInternalService {

    private final LockerZoneRepository lockerZoneRepository;

    @Transactional(readOnly = true)
    public List<LockerZone> findAllByGymId(Long gymId) {
        return lockerZoneRepository.findAllByGym_Id(gymId);
    }

    @Transactional(readOnly = true)
    public LockerZone findById(Long zoneId) {
        return lockerZoneRepository.findById(zoneId)
                .orElseThrow(() -> new LockerException(LockerErrorCode.ZONE_NOT_FOUND));
    }
}
