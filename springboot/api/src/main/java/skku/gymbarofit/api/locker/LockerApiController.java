package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.locker.service.LockerFacade;
import skku.gymbarofit.api.locker.service.LockerService;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.core.item.locker.dto.*;

@RequestMapping("/lockers")
@RequiredArgsConstructor
@RestController
public class LockerApiController {

    private final LockerService lockerService;
    private final LockerFacade lockerFacade;

    @PreAuthorize("hasAnyRole('MEMBER', 'OWNER')")
    @GetMapping("/zones")
    public ResponseEntity<ZoneListResponseDto> zones(
            @RequestParam Long gymId
    ) {
        return ResponseEntity.ok(lockerService.getZoneList(gymId));
    }

    @PreAuthorize("hasAnyRole('MEMBER', 'OWNER')")
    @GetMapping("/zones/{zoneId}/lockers")
    public ResponseEntity<LockerListResponseDto> lockers(
            @PathVariable Long zoneId
    ) {
        return ResponseEntity.ok(lockerService.getLockerList(zoneId));
    }

    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/usages")
    public ResponseEntity<LockerRentResponseDto> rentLocker(
            @CurrentUserId Long memberId,
            @RequestBody LockerRentRequestDto request
    ) {
        return ResponseEntity.ok(lockerFacade.rent(memberId, request));
    }

    @PreAuthorize("hasRole('MEMBER')")
    @DeleteMapping("/usages/{usageId}")
    public ResponseEntity<Void> refundLocker(
            @CurrentUserId Long memberId,
            @PathVariable Long usageId
    ) {
        lockerFacade.refund(memberId, usageId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('MEMBER')")
    @GetMapping("/usages/{usageId}")
    public ResponseEntity<LockerRentResponseDto> lockerInfo(
            @PathVariable Long usageId
    ) {
        return ResponseEntity.ok(lockerService.getLockerInfo(usageId));
    }

    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/usages/{usageId}/extend")
    public ResponseEntity<LockerRentResponseDto> extendLocker(
            @PathVariable Long usageId,
            @RequestBody LockerExtendRequestDto request
    ) {
        return ResponseEntity.ok(lockerFacade.extend(usageId, request));
    }
}
