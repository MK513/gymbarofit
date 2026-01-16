package skku.gymbarofit.core.usage.equipment.dto;

import lombok.Builder;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

import java.time.LocalDateTime;

@Builder
public record EquipmentUsageResponseDto (
    Long id,
    String name,
    String imageUrl,
    int waitingCount
) {

    public static EquipmentUsageResponseDto from(EquipmentUsage usage, Equipment equipment, int waitingCount) {
        if (usage == null) return null;

        return EquipmentUsageResponseDto.builder()
                .id(usage.getId())
                .name(equipment.getItemInfo().getName())
                .imageUrl(equipment.getImageUrl())
                .waitingCount(waitingCount)
                .build();
    }
}
