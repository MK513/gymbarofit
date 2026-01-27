package skku.gymbarofit.core.membership.dto;

import lombok.Builder;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentHistoryResponseDto;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentUsageDetailResponseDto;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentUsageResponseDto;
import skku.gymbarofit.core.usage.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.dto.LockerRentResponseDto;

@Builder
public record MembershipInfoResponseDto (
        GymResponseDto gym,
        LockerRentResponseDto lockerUsage,
        EquipmentUsageResponseDto equipmentUsage,
        EquipmentHistoryResponseDto history
) {

    public static MembershipInfoResponseDto from(
            GymResponseDto gymResponseDto,
            LockerUsage lockerUsage,
            EquipmentUsageResponseDto equipmentUsage,
            EquipmentHistoryResponseDto historyDto
    ) {
        return MembershipInfoResponseDto.builder()
                .gym(gymResponseDto)
                .lockerUsage(LockerRentResponseDto.from(lockerUsage))
                .equipmentUsage(equipmentUsage)
                .history(historyDto)
                .build();
    }
}
