package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.locker.service.LockerService;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.api.user.owner.dto.LockerZoneCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneSummaryDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneUpdateRequestDto;
import skku.gymbarofit.core.item.locker.dto.LockerResponseDto;
import skku.gymbarofit.core.item.locker.dto.LockerStatusUpdateRequestDto;

import java.util.List;

@RequestMapping("/owners/lockers")
@RequiredArgsConstructor
@RestController
@PreAuthorize("hasRole('OWNER')")
public class OwnerLockerApiController {

    private final LockerService lockerService;

    @GetMapping("/zones")
    public ResponseEntity<List<LockerZoneSummaryDto>> getLockerZones(
            @RequestParam Long gymId
    ) {
        return ResponseEntity.ok(lockerService.getLockerZonesForOwner(gymId));
    }

    @PostMapping("/zones")
    public ResponseEntity<Void> addLockerZone(
            @CurrentUserId Long ownerId,
            @RequestBody LockerZoneCreateRequestDto dto
    ) {
        lockerService.addLockerZone(ownerId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PatchMapping("/zones/{zoneId}")
    public ResponseEntity<LockerZoneSummaryDto> updateLockerZone(
            @CurrentUserId Long ownerId,
            @PathVariable Long zoneId,
            @RequestBody LockerZoneUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(lockerService.updateLockerZone(ownerId, zoneId, dto));
    }

    @DeleteMapping("/zones/{zoneId}")
    public ResponseEntity<Void> deleteLockerZone(
            @CurrentUserId Long ownerId,
            @PathVariable Long zoneId
    ) {
        lockerService.deleteLockerZone(ownerId, zoneId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{lockerId}/status")
    public ResponseEntity<LockerResponseDto> updateLockerStatus(
            @CurrentUserId Long ownerId,
            @PathVariable Long lockerId,
            @RequestBody LockerStatusUpdateRequestDto request
    ) {
        return ResponseEntity.ok(lockerService.updateLockerStatus(ownerId, lockerId, request));
    }
}
