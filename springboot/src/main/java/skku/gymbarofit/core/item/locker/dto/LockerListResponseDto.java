package skku.gymbarofit.core.item.locker.dto;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
public record LockerListResponseDto(long availableCount, long unavailableCount, List<LockerResponseDto> lockers) {

    public static LockerListResponseDto of(long availableCount, long unavailableCount, List<LockerResponseDto> lockers) {
        return new LockerListResponseDto(availableCount, unavailableCount, lockers);
    }
}
