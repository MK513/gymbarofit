package skku.gymbarofit.core.item.locker.dto;

import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public record LockerListResponseDto(List<LockerResponseDto> lockers) {

    public static LockerListResponseDto of(List<Locker> lockers, List<LockerUsage> activeUsages) {

        Map<Long, LockerUsageStatus> usageStatusMap = activeUsages.stream()
                        .collect(Collectors.toMap(
                                u -> u.getLocker().getId(),
                                LockerUsage::getStatus
                        ));

        List<LockerResponseDto> listDto = lockers.stream()
                .map(l -> LockerResponseDto.of(
                        l, usageStatusMap.get(l.getId()))).toList();

        return new LockerListResponseDto(listDto);
    }
}
