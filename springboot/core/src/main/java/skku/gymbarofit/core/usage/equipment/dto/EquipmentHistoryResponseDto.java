package skku.gymbarofit.core.usage.equipment.dto;

import lombok.Builder;

import java.util.List;

@Builder
public record EquipmentHistoryResponseDto (
        int todayTotalUsageMinutes,
        float todayTotalCalories,
        List<EquipmentRecordResponseDto> recentThreeUsages
) {
    public static EquipmentHistoryResponseDto of(int todayTotalUsageMinutes, float todayTotalCalories, List<EquipmentRecordResponseDto> recentThreeUsages) {
        return EquipmentHistoryResponseDto.builder()
                .todayTotalUsageMinutes(todayTotalUsageMinutes)
                .todayTotalCalories(todayTotalCalories)
                .recentThreeUsages(recentThreeUsages)
                .build();
    }
}
