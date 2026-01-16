package skku.gymbarofit.core.item.equipment.dto;

import java.util.List;

public record EquipmentListResponseDto (
        int totalCount,
        List<String> equipmentTypes,
        List<EquipmentResponseDto> equipments
) {
    public static EquipmentListResponseDto of(int totalCount, List<String> equipmentTypes, List<EquipmentResponseDto> listDto) {
        return new EquipmentListResponseDto(totalCount, equipmentTypes, listDto);
    }
}
