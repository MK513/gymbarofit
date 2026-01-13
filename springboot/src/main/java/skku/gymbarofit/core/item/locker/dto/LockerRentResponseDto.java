package skku.gymbarofit.core.item.locker.dto;

import lombok.Builder;
import skku.gymbarofit.core.item.locker.LockerUsage;

import java.time.LocalDate;

@Builder
public record LockerRentResponseDto(
        Long usageId,
        Long lockerId,
        String name,
        String zoneName,
        int lockerNumber,
        LocalDate startDate,
        LocalDate endDate
) {
    public static LockerRentResponseDto from(LockerUsage lockerUsage) {

        if (lockerUsage == null) {return null;}

        return LockerRentResponseDto.builder()
                .usageId(lockerUsage.getId())
                .lockerId(lockerUsage.getLocker().getId())
                .name(lockerUsage.getLocker().getItemInfo().getName())
                .zoneName(lockerUsage.getLocker().getLockerZone().getName())
                .lockerNumber(lockerUsage.getLocker().getLockerNumber())
                .startDate(lockerUsage.getStartDate())
                .endDate(lockerUsage.getEndDate())
                .build();
    }
}
