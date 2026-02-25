package skku.gymbarofit.api.user.owner.dto;

import skku.gymbarofit.core.gym.Gym;

import java.util.List;

public record OwnerGymSummaryDto(
        Long id,
        String name,
        String address,
        List<DayScheduleDto> operatingHours,
        int currentOccupancy,
        int maxCapacity,
        String crowdLevel,
        String status,
        int totalEquipments,
        int activeEquipments,
        int totalLockers,
        int rentedLockers
) {
    public static OwnerGymSummaryDto of(Gym gym,
                                        int totalEquipments, int activeEquipments,
                                        int totalLockers, int rentedLockers) {
        List<DayScheduleDto> hours = gym.getOperatingHours().stream()
                .map(h -> new DayScheduleDto(
                        h.getDayOfWeek().name(),
                        h.getOpenAt() != null ? h.getOpenAt().toString() : null,
                        h.getCloseAt() != null ? h.getCloseAt().toString() : null,
                        h.isClosed()
                ))
                .toList();

        return new OwnerGymSummaryDto(
                gym.getId(),
                gym.getName(),
                gym.getAddress(),
                hours,
                gym.getCurrentOccupancy(),
                gym.getMaxCapacity(),
                gym.getCrowdLevel() != null ? gym.getCrowdLevel().name() : null,
                gym.getStatus() != null ? gym.getStatus().name() : null,
                totalEquipments,
                activeEquipments,
                totalLockers,
                rentedLockers
        );
    }
}
