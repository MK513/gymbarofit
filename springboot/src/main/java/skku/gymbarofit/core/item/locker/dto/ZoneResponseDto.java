package skku.gymbarofit.core.item.locker.dto;

import skku.gymbarofit.core.item.enums.SizeStatus;
import skku.gymbarofit.core.item.locker.LockerZone;

public record ZoneResponseDto(
        Long id,
        String name,
        int rowCount,
        int columnCount,
        int totalCount,
        SizeStatus lockerSize
) {
    public static ZoneResponseDto of(LockerZone z) {
        return new ZoneResponseDto(z.getId(), z.getName(), z.getRowCount(), z.getColumnCount(), z.getTotalCount(), z.getLockerSize());
    }
}

