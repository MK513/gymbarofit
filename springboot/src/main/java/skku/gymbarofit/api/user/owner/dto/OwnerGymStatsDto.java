package skku.gymbarofit.api.user.owner.dto;

import java.util.List;

public record OwnerGymStatsDto(
        List<HourlyVisitDto> visitByHour,
        List<EquipmentUsageStatsDto> equipmentUsage,
        List<LockerZoneUsageDto> lockerZoneUsage,
        List<MonthlyEquipmentUsageDto> monthlyEquipmentUsage
) {
    public record HourlyVisitDto(int hour, int count) {}
    public record EquipmentUsageStatsDto(String name, int inUseCount, int totalCount) {}
    public record LockerZoneUsageDto(String zoneName, int rentedCount, int totalCount) {}
    public record MonthlyEquipmentUsageDto(String name, int totalMinutes) {}
}
