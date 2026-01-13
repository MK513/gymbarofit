package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.locker.service.LockerFacade;
import skku.gymbarofit.api.locker.service.LockerService;
import skku.gymbarofit.api.membership.annotation.CurrentUserId;
import skku.gymbarofit.core.item.locker.dto.*;

@RequestMapping("/lockers")
@RequiredArgsConstructor
@RestController
public class LockerApiController {

    private final LockerService lockerService;
    private final LockerFacade lockerFacade;

    @GetMapping("/zones")
    public ResponseEntity<ZoneListResponseDto> zones(
            @RequestParam Long gymId
    ) {
        return ResponseEntity.ok(lockerService.getZoneList(gymId));
    }

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
        return ResponseEntity.ok(lockerFacade.rent(memberId, request));
    }

    @DeleteMapping("/usages/{usageId}")
    public ResponseEntity<Void> refundLocker(
            @CurrentUserId Long memberId,
            @PathVariable Long usageId
    ) {
        lockerFacade.refund(memberId, usageId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usages/{usageId}/extend")
    public ResponseEntity<LockerRentResponseDto> lockerInfo(
            @PathVariable Long usageId
    ) {
        return ResponseEntity.ok(lockerService.getLockerInfo(usageId));
    }

    @PostMapping("/usages/{usageId}/extend")
    public ResponseEntity<LockerRentResponseDto> extendLocker(
            @PathVariable Long usageId,
            @RequestBody LockerExtendRequestDto request
    ) {
        return ResponseEntity.ok(lockerFacade.extend(usageId, request));
    }

}
