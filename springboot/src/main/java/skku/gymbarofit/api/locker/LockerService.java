package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.dto.LockerListResponseDto;
import skku.gymbarofit.core.item.locker.dto.ZoneListResponseDto;
import skku.gymbarofit.core.item.locker.service.LockerInternalService;
import skku.gymbarofit.core.item.locker.service.LockerUsageInternalService;
import skku.gymbarofit.core.item.locker.service.LockerZoneInternalService;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerService {

    private final LockerZoneInternalService lockerZoneInternalService;
    private final LockerInternalService lockerInternalService;
    private final LockerUsageInternalService lockerUsageInternalService;

    @Transactional(readOnly = true)
    public ZoneListResponseDto findZonesByGymId(Long gymId) {
        List<LockerZone> zones = lockerZoneInternalService.findAllByGymId(gymId);
        return ZoneListResponseDto.of(zones);
    }

    @Transactional(readOnly = true)
    public LockerListResponseDto findLockersByZoneId(Long zoneId) {

        List<Locker> lockers = lockerInternalService.findAllByZoneId(zoneId);
        List<LockerUsage> usages = lockerUsageInternalService.findAllActiveByZoneId(zoneId);

        return LockerListResponseDto.of(lockers, usages);
    }
}
