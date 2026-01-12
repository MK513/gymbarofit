package skku.gymbarofit.core.item.locker.dto;

import lombok.Builder;
import skku.gymbarofit.core.item.locker.LockerUsage;

import java.time.LocalDate;

@Builder
public record LockerRentResponseDto(
        Long usageId,
        Long lockerId,
        Long paymentId,
        String name,
        int lockerNumber,
        LocalDate startDate,
        LocalDate endDate
) {
    public static LockerRentResponseDto from(LockerUsage lockerUsage) {

        if (lockerUsage == null) {return null;}

        return LockerRentResponseDto.builder()
                .usageId(lockerUsage.getId())
                .lockerId(lockerUsage.getLocker().getId())
                .paymentId(lockerUsage.getPayment().getId())
                .name(lockerUsage.getLocker().getItemInfo().getName())
                .lockerNumber(lockerUsage.getLocker().getLockerNumber())
                .startDate(lockerUsage.getStartDate())
                .endDate(lockerUsage.getEndDate())
                .build();
    }
}
