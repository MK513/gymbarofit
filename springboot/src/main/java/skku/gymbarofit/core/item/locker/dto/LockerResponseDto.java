package skku.gymbarofit.core.item.locker.dto;

import skku.gymbarofit.core.item.enums.ItemStatus;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;

public record LockerResponseDto(
        Long id,
        String name,
        ItemStatus itemStatus,
        LockerUsageStatus usageStatus,
        int lockerNumber
) {

    public static LockerResponseDto of(Locker locker, LockerUsageStatus usageStatus) {
        ItemStatus itemStatus = locker.getItemInfo().getStatus();

        return new LockerResponseDto(
            locker.getId(),
            locker.getItemInfo().getName(),
            itemStatus,
            usageStatus,
            locker.getLockerNumber()
            );
    }
}