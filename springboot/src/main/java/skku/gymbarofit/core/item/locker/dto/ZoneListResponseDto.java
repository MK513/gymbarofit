package skku.gymbarofit.core.item.locker.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import skku.gymbarofit.core.item.locker.LockerZone;

import java.util.List;

public record ZoneListResponseDto(List<ZoneResponseDto> zones) {

    public static ZoneListResponseDto of(List<LockerZone> zones) {
        return new ZoneListResponseDto(zones.stream().map(ZoneResponseDto::of).toList());
    }
}
