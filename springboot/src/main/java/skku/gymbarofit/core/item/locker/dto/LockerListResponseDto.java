package skku.gymbarofit.core.item.locker.dto;

import lombok.extern.slf4j.Slf4j;
import skku.gymbarofit.core.item.enums.ItemStatus;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
public record LockerListResponseDto(long availableCount, long unavailableCount, List<LockerResponseDto> lockers) {

    public static LockerListResponseDto from(List<Locker> lockers, List<LockerUsage> unavailableUsage) {

        Map<Long, LockerUsageStatus> usageStatusMap = unavailableUsage.stream()
                        .collect(Collectors.toMap(
                                u -> u.getLocker().getId(),
                                LockerUsage::getStatus
                        ));

        List<LockerResponseDto> listDto = lockers.stream()
                .map(l -> LockerResponseDto.of(
                        l, usageStatusMap.get(l.getId()))).toList();

        long availableCount = lockers.stream()
                .filter(l -> {
                    LockerUsageStatus usageStatus = usageStatusMap.get(l.getId());
                    ItemStatus itemStatus = l.getItemInfo().getStatus();
                    return usageStatus == null && itemStatus == ItemStatus.OK;
                })
                .count();

        long unavailableCount = lockers.size() - availableCount;

        return new LockerListResponseDto(availableCount, unavailableCount ,listDto);
    }
}
