package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
<<<<<<< HEAD
=======
import org.springframework.http.HttpStatus;
>>>>>>> origin/main
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.locker.service.LockerFacade;
import skku.gymbarofit.api.locker.service.LockerService;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
<<<<<<< HEAD
import skku.gymbarofit.core.item.locker.dto.*;

=======
import skku.gymbarofit.api.user.owner.dto.LockerZoneCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneSummaryDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneUpdateRequestDto;
import skku.gymbarofit.core.item.locker.dto.*;

import java.util.List;

>>>>>>> origin/main
@RequestMapping("/lockers")
@RequiredArgsConstructor
@RestController
public class LockerApiController {

<<<<<<< HEAD
    private final LockerService lockerService;
    private final LockerFacade lockerFacade;

=======
    //TODO API 경로 수정

    private final LockerService lockerService;
    private final LockerFacade lockerFacade;

    // ─── 회원용 ────────────────────────────────────────────────────────────────

>>>>>>> origin/main
    @PreAuthorize("hasAnyRole('MEMBER', 'OWNER')")
    @GetMapping("/zones")
    public ResponseEntity<ZoneListResponseDto> zones(
            @RequestParam Long gymId
    ) {
        return ResponseEntity.ok(lockerService.getZoneList(gymId));
    }

    @PreAuthorize("hasAnyRole('MEMBER', 'OWNER')")
<<<<<<< HEAD
    @GetMapping("/zones/{zoneId}/lockers")
=======
    @GetMapping("/zones/{zoneId}")
>>>>>>> origin/main
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
<<<<<<< HEAD
=======

    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{lockerId}/status")
    public ResponseEntity<LockerResponseDto> updateLockerStatus(
            @CurrentUserId Long ownerId,
            @PathVariable Long lockerId,
            @RequestBody LockerStatusUpdateRequestDto request
    ) {
        return ResponseEntity.ok(lockerService.updateLockerStatus(ownerId, lockerId, request));
    }

    // ─── 오너용 LockerZone 관리 ─────────────────────────────────────────────────

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/zones/manage")
    public ResponseEntity<List<LockerZoneSummaryDto>> getLockerZones(
            @RequestParam Long gymId
    ) {
        return ResponseEntity.ok(lockerService.getLockerZonesForOwner(gymId));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/zones")
    public ResponseEntity<Void> addLockerZone(
            @CurrentUserId Long ownerId,
            @RequestBody LockerZoneCreateRequestDto dto
    ) {
        lockerService.addLockerZone(ownerId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/zones/{zoneId}")
    public ResponseEntity<LockerZoneSummaryDto> updateLockerZone(
            @CurrentUserId Long ownerId,
            @PathVariable Long zoneId,
            @RequestBody LockerZoneUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(lockerService.updateLockerZone(ownerId, zoneId, dto));
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/zones/{zoneId}")
    public ResponseEntity<Void> deleteLockerZone(
            @CurrentUserId Long ownerId,
            @PathVariable Long zoneId
    ) {
        lockerService.deleteLockerZone(ownerId, zoneId);
        return ResponseEntity.noContent().build();
    }
>>>>>>> origin/main
}
