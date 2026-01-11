package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.core.item.locker.dto.LockerListResponseDto;
import skku.gymbarofit.core.item.locker.dto.LockerRentResponseDto;
import skku.gymbarofit.core.item.locker.dto.ZoneListResponseDto;

@RequestMapping("/lockers")
@RequiredArgsConstructor
@RestController
public class LockerApiController {

    private final LockerService lockerService;

    @GetMapping("/zones")
    public ResponseEntity<ZoneListResponseDto> zones(
            @RequestParam Long gymId
    ) {
        return ResponseEntity.ok(lockerService.findZonesByGymId(gymId));
    }

    @GetMapping("/zones/{zoneId}")
    public ResponseEntity<LockerListResponseDto> zoneDetail(
            @PathVariable Long zoneId
    ) {
        return ResponseEntity.ok(lockerService.findLockersByZoneId(zoneId));
    }

    @PostMapping("/rent/{lockerId}")
    public ResponseEntity<LockerRentResponseDto> rentLocker(@PathVariable Long lockerId) {
        return ResponseEntity.ok().build();
    }
}
