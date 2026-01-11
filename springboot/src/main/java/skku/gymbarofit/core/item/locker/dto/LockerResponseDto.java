package skku.gymbarofit.core.item.locker.dto;

import skku.gymbarofit.core.item.enums.ItemStatus;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;

public record LockerResponseDto(
        Long id,
        String name,
        ItemStatus condition,
        LockerUsageStatus status,
        int lockerNumber
) {

    public static LockerResponseDto of(Locker locker, LockerUsageStatus status) {
        ItemStatus condition = locker.getItemInfo().getStatus();

        return new LockerResponseDto(
            locker.getId(),
            locker.getItemInfo().getName(),
            condition,
            status ,
            locker.getLockerNumber()
            );
    }
}