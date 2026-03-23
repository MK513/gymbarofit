package skku.gymbarofit.core.usage.equipment.dto;

import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public record WorkoutHistoryResponseDto(
        int totalDays,
        int totalUsageMinutes,
        float totalCalories,
        List<DailyWorkoutGroupDto> dailyRecords
) {

    public static WorkoutHistoryResponseDto from(List<EquipmentUsage> usages) {
        Map<Integer, List<EquipmentUsage>> byDay = usages.stream()
                .collect(Collectors.groupingBy(u -> u.getEndAt().getDayOfMonth()));

        List<DailyWorkoutGroupDto> dailyRecords = byDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new DailyWorkoutGroupDto(
                        e.getKey(),
                        e.getValue().stream().map(DailyWorkoutItemDto::from).toList()
                ))
                .toList();

        int totalDays = byDay.size();
        int totalMinutes = usages.stream().mapToInt(EquipmentUsage::getDurationMinutes).sum();
        float totalCalories = usages.stream()
                .map(DailyWorkoutItemDto::calcCalories)
                .reduce(0f, Float::sum);
        totalCalories = Math.round(totalCalories * 10f) / 10f;

        return new WorkoutHistoryResponseDto(totalDays, totalMinutes, totalCalories, dailyRecords);
    }
}
