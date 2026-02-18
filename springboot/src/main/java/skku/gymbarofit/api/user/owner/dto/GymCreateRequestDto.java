package skku.gymbarofit.api.user.owner.dto;

public record GymCreateRequestDto(
        String name,
        String address,
        int maxCapacity,
        String openAt,   // HH:mm
        String closeAt   // HH:mm
) {}
