package skku.gymbarofit.core.usage.equipment.dto;

import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

<<<<<<< HEAD
import java.time.ZoneId;

=======
>>>>>>> origin/main
@Slf4j
@Builder
public record EquipmentUsageDetailResponseDto(
    Long usageId,
    Long equipmentId,
    String name,
    String imageUrl,
<<<<<<< HEAD
    int waitingCount,
    Long startAtMs
=======
    int waitingCount
>>>>>>> origin/main
) {

    public static EquipmentUsageDetailResponseDto from(EquipmentUsage usage, Equipment equipment, int waitingCount) {
        if (usage == null) return null;

<<<<<<< HEAD
        Long startAtMs = usage.getStartAt() != null
                ? usage.getStartAt().atZone(ZoneId.of("Asia/Seoul")).toInstant().toEpochMilli()
                : null;

=======
>>>>>>> origin/main
        return EquipmentUsageDetailResponseDto.builder()
                .usageId(usage.getId())
                .equipmentId(equipment.getId())
                .name(equipment.getItemInfo().getName())
                .imageUrl(equipment.getImageUrl())
                .waitingCount(waitingCount)
<<<<<<< HEAD
                .startAtMs(startAtMs)
=======
>>>>>>> origin/main
                .build();
    }
}
