package skku.gymbarofit.api.user.owner.dto;

import skku.gymbarofit.core.item.locker.LockerZone;

public record LockerZoneSummaryDto(
        Long id,
        String name,
        String size,
        int rowCount,
        int columnCount,
        int totalCount,
        int rentedCount
) {
    public static LockerZoneSummaryDto of(LockerZone zone, int rentedCount) {
        return new LockerZoneSummaryDto(
                zone.getId(),
                zone.getName(),
                zone.getLockerSize().name(),
                zone.getRowCount(),
                zone.getColumnCount(),
                zone.getTotalCount(),
                rentedCount
        );
    }
}
