package skku.gymbarofit.core.usage.equipment.dto;

import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

public record DailyWorkoutItemDto(
        Long id,
        String title,
        int minutes,
        float calories,
        String type
) {

    public static DailyWorkoutItemDto from(EquipmentUsage u) {
        return new DailyWorkoutItemDto(
                u.getId(),
                u.getEquipment().getItemInfo().getName(),
                u.getDurationMinutes(),
                calcCalories(u),
                u.getEquipment().getType()
        );
    }

    static float calcCalories(EquipmentUsage u) {
        int min = u.getDurationMinutes();
        if (min <= 0) return 0f;
        float met = u.getEquipment().getMet();
        float weight = u.getMember().getWeight();
        return Math.round(met * weight * (min / 60f) * 10f) / 10f;
    }
}
