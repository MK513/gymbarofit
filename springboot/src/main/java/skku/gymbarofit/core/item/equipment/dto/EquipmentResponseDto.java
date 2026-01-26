package skku.gymbarofit.core.item.equipment.dto;

import lombok.Builder;
import skku.gymbarofit.core.item.enums.ItemStatus;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Builder
public record EquipmentResponseDto (
        Long id,
        String name,
        String location,
        String type,
        String imageUrl,
        Integer waitingCount,
        ItemStatus itemStatus,
        EquipmentUsageStatus usageStatus
) {

//    public static EquipmentResponseDto of(Equipment equipment) {
//        return EquipmentResponseDto.builder()
//                .id(equipment.getId())
//                .name(equipment.getItemInfo().getName())
//                .location(equipment.getLocation())
//                .type(equipment.getType())
//                .imageUrl(equipment.getImageUrl())
//                .waitingCount(0)
//                .itemStatus(equipment.getItemInfo().getStatus())
//                .usageStatus(EquipmentUsageStatus.AVAILABLE)
//                .build();
//    }

    public static EquipmentResponseDto from(Equipment equipment, List<EquipmentUsage> usages) {

        Map<EquipmentUsageStatus, List<EquipmentUsage>> usageMap =
                usages.stream().collect(Collectors.groupingBy(EquipmentUsage::getStatus));

        int waitingCount = usageMap.getOrDefault(EquipmentUsageStatus.WAITING, List.of()).size();

        EquipmentUsage inUse = usageMap.getOrDefault(EquipmentUsageStatus.IN_USE, List.of())
                .stream().findFirst().orElse(null);

        EquipmentUsage called = usageMap.getOrDefault(EquipmentUsageStatus.CALLED, List.of())
                .stream().findFirst().orElse(null);

        EquipmentUsageStatus usageStatus;
        if (inUse != null) {
            usageStatus = EquipmentUsageStatus.IN_USE;
        } else if (called != null) {
            usageStatus = EquipmentUsageStatus.CALLED;
        } else if (waitingCount > 0) {
            usageStatus = EquipmentUsageStatus.WAITING;
        } else {
            usageStatus = EquipmentUsageStatus.AVAILABLE;
        }

        return EquipmentResponseDto.builder()
                .id(equipment.getId())
                .name(equipment.getItemInfo().getName())
                .location(equipment.getLocation())
                .type(equipment.getType())
                .imageUrl(equipment.getImageUrl())
                .waitingCount(waitingCount)
                .itemStatus(equipment.getItemInfo().getStatus())
                .usageStatus(usageStatus)
                .build();
    }
}
