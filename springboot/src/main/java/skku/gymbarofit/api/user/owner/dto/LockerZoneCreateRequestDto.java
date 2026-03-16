package skku.gymbarofit.api.user.owner.dto;

public record LockerZoneCreateRequestDto(
        String name,
        String size,
        int rowCount,
        int columnCount
) {}
