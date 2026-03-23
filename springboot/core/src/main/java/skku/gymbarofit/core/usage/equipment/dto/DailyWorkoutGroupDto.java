package skku.gymbarofit.core.usage.equipment.dto;

import java.util.List;

public record DailyWorkoutGroupDto(
        int day,
        List<DailyWorkoutItemDto> workouts
) {}
