package skku.gymbarofit.api.user.owner.dto;

import java.util.List;

public record SaveMapRequestDto(
        Integer mapWidth,
        Integer mapHeight,
        List<EquipmentPlacementDto> equipments
) {
    public record EquipmentPlacementDto(Long id, Integer gridX, Integer gridY, Integer spanW, Integer spanH) {}
}
