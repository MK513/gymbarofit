package skku.gymbarofit.core.usage.equipment.dto;

import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

@Slf4j
@Builder
public record EquipmentUsageDetailResponseDto(
    Long usageId,
    Long equipmentId,
    String name,
    String imageUrl,
    int waitingCount
) {

    public static EquipmentUsageDetailResponseDto from(EquipmentUsage usage, Equipment equipment, int waitingCount) {
        if (usage == null) return null;

        return EquipmentUsageDetailResponseDto.builder()
                .usageId(usage.getId())
                .equipmentId(equipment.getId())
                .name(equipment.getItemInfo().getName())
                .imageUrl(equipment.getImageUrl())
                .waitingCount(waitingCount)
                .build();
    }
}
