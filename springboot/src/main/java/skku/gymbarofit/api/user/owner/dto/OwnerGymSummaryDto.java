package skku.gymbarofit.api.user.owner.dto;

import skku.gymbarofit.core.gym.Gym;

import java.util.List;

public record OwnerGymSummaryDto(
        Long id,
        String name,
        String postalCode,
        String address,
        List<DayScheduleDto> operatingHours,
        int currentOccupancy,
        int maxCapacity,
        String crowdLevel,
        String status,
        Integer currentStep,
        int totalEquipments,
        int activeEquipments,
        int totalLockers,
        int rentedLockers
) {
    public static OwnerGymSummaryDto of(Gym gym,
                                        int totalEquipments, int activeEquipments,
                                        int totalLockers, int rentedLockers) {
        return of(gym, totalEquipments, activeEquipments, totalLockers, rentedLockers, null);
    }

    public static OwnerGymSummaryDto of(Gym gym,
                                        int totalEquipments, int activeEquipments,
                                        int totalLockers, int rentedLockers,
                                        Integer currentStep) {
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
                gym.getPostalCode(),
                gym.getAddress(),
                hours,
                gym.getCurrentOccupancy(),
                gym.getMaxCapacity(),
                gym.getCrowdLevel() != null ? gym.getCrowdLevel().name() : null,
                gym.getStatus() != null ? gym.getStatus().name() : null,
                currentStep,
                totalEquipments,
                activeEquipments,
                totalLockers,
                rentedLockers
        );
    }
}
