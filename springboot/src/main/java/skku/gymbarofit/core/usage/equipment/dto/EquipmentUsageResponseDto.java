package skku.gymbarofit.core.usage.equipment.dto;

import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

import java.time.LocalDateTime;

@Slf4j
@Builder
public record EquipmentUsageResponseDto (
    Long equipmentId,
    String name,
    String imageUrl,
    int waitingCount
) {

    public static EquipmentUsageResponseDto from(EquipmentUsage usage, Equipment equipment, int waitingCount) {
        if (usage == null) return null;

        return EquipmentUsageResponseDto.builder()
                .equipmentId(equipment.getId())
                .name(equipment.getItemInfo().getName())
                .imageUrl(equipment.getImageUrl())
                .waitingCount(waitingCount)
                .build();
    }
}
