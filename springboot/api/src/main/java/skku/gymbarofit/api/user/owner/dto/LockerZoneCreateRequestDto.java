package skku.gymbarofit.api.user.owner.dto;

public record LockerZoneCreateRequestDto(
        Long gymId,
        String name,
        String size,
        int rowCount,
        int columnCount
) {}
