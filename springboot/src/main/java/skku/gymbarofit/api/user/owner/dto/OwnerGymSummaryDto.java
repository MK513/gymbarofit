package skku.gymbarofit.api.user.owner.dto;

import skku.gymbarofit.core.gym.Gym;

public record OwnerGymSummaryDto(
        Long id,
        String name,
        String address,
        String openAt,
        String closeAt,
        int currentOccupancy,
        int maxCapacity,
        String crowdLevel,
        int totalEquipments,
        int activeEquipments,
        int totalLockers,
        int rentedLockers
) {
    public static OwnerGymSummaryDto of(Gym gym,
                                        int totalEquipments, int activeEquipments,
                                        int totalLockers, int rentedLockers) {
        return new OwnerGymSummaryDto(
                gym.getId(),
                gym.getName(),
                gym.getAddress(),
                gym.getOpenAt() != null ? gym.getOpenAt().toString() : null,
                gym.getCloseAt() != null ? gym.getCloseAt().toString() : null,
                gym.getCurrentOccupancy(),
                gym.getMaxCapacity(),
                gym.getCrowdLevel() != null ? gym.getCrowdLevel().name() : null,
                totalEquipments,
                activeEquipments,
                totalLockers,
                rentedLockers
        );
    }
}
