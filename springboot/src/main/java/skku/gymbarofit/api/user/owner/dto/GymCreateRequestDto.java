package skku.gymbarofit.api.user.owner.dto;

import java.util.List;

public record GymCreateRequestDto(
        String name,
        String postalCode,
        String address,
        int maxCapacity,
        List<DayScheduleDto> operatingHours
) {}
