package skku.gymbarofit.api.user.owner.dto;

public record EquipmentCreateRequestDto(
        String name,
        String type,
        int count,
        String imageUrl,
        Integer gridX,
        Integer gridY,
        Integer spanW,
        Integer spanH
) {}
