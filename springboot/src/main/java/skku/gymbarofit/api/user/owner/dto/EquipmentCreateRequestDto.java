package skku.gymbarofit.api.user.owner.dto;

public record EquipmentCreateRequestDto(
        String name,
        String type,
        int count,
        String imageUrl,
        String location
) {}
