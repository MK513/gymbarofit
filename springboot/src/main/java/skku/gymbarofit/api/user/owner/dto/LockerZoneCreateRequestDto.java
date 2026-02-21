package skku.gymbarofit.api.user.owner.dto;

public record LockerZoneCreateRequestDto(
        String size,
        int rowCount,
        int columnCount
) {}
