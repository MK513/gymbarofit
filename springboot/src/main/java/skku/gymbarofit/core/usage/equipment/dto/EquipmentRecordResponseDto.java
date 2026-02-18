package skku.gymbarofit.core.usage.equipment.dto;

import lombok.Builder;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

@Builder
public record EquipmentRecordResponseDto(
        String title,
        int minutes,
        float calories
){

    public static EquipmentRecordResponseDto from(EquipmentUsage usage) {
        return EquipmentRecordResponseDto.builder()
                .title(usage.getEquipment().getItemInfo().getName())
                .minutes(usage.getDurationMinutes())
                .calories(calculateCalory(usage))
                .build();
    }

    private static float calculateCalory(EquipmentUsage usage) {
        int minutes = usage.getDurationMinutes();
        if (minutes <= 0) return 0f;

        float met = usage.getEquipment().getMet();
        float weight = usage.getMember().getWeight(); // kg

        float calories = met * weight * (minutes / 60f);
        return Math.round(calories * 10f) / 10f;
    }
}
