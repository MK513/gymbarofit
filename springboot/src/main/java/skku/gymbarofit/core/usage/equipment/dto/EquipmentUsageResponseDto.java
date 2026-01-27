package skku.gymbarofit.core.usage.equipment.dto;

import lombok.Builder;

@Builder
public record EquipmentUsageResponseDto(
        EquipmentUsageDetailResponseDto inUseDto,
        EquipmentUsageDetailResponseDto waitingDto
) {
    public static EquipmentUsageResponseDto of(EquipmentUsageDetailResponseDto inUseDto, EquipmentUsageDetailResponseDto waitingDto) {
        return EquipmentUsageResponseDto.builder()
                .inUseDto(inUseDto)
                .waitingDto(waitingDto)
                .build();
    }
}
