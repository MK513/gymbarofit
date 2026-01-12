package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.membership.annotation.CurrentUserId;
import skku.gymbarofit.core.item.locker.dto.LockerListResponseDto;
import skku.gymbarofit.core.item.locker.dto.LockerRentRequestDto;
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
        return ResponseEntity.ok(lockerService.getZoneList(gymId));
    }

    // TODO Pageable로 바꾸기?
    @GetMapping("/zones/{zoneId}")
    public ResponseEntity<LockerListResponseDto> lockers(
            @PathVariable Long zoneId
    ) {
        return ResponseEntity.ok(lockerService.getLockerList(zoneId));
    }

    @PostMapping("/usages")
    public ResponseEntity<LockerRentResponseDto> rentLocker(
            @CurrentUserId Long memberId,
            @RequestBody LockerRentRequestDto request
    ) {
        return ResponseEntity.ok(lockerService.rent(memberId, request));
    }
}
