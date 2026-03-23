package skku.gymbarofit.api.gym;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.equipment.EquipmentService;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.api.user.owner.dto.GymCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.GymMapResponseDto;
import skku.gymbarofit.api.user.owner.dto.GymUpdateRequestDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymEquipmentDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymStatsDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymSummaryDto;
import skku.gymbarofit.api.user.owner.dto.SaveMapRequestDto;
import skku.gymbarofit.core.gym.dto.GymDetailResponseDto;
import skku.gymbarofit.core.item.equipment.dto.EquipmentListResponseDto;

import java.util.List;

import static org.springframework.data.domain.Sort.*;

@RestController
@RequestMapping("/gyms")
@RequiredArgsConstructor
public class GymApiController {

    private final GymService gymService;
    private final EquipmentService equipmentService;


    @PreAuthorize("hasAnyRole('MEMBER', 'OWNER')")
    @GetMapping("/search")
    public Page<GymDetailResponseDto> search(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "id", direction = Direction.DESC) Pageable pageable
    ) {
        return gymService.searchByKeyword(keyword, pageable);
    }

    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/{gymId}/memberships")
    public ResponseEntity<GymDetailResponseDto> register(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {
        GymDetailResponseDto response = gymService.register(memberId, gymId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("hasAnyRole('MEMBER', 'OWNER')")
    @GetMapping("/{gymId}/equipments")
    public ResponseEntity<EquipmentListResponseDto> getEquipments(
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(equipmentService.getEquipments(gymId));
    }

    // ─── 오너용 Gym 관리 ────────────────────────────────────────────────────────

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/my")
    public ResponseEntity<List<OwnerGymSummaryDto>> getMyGyms(
            @CurrentUserId Long ownerId
    ) {
        return ResponseEntity.ok(gymService.getMyGyms(ownerId));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping
    public ResponseEntity<OwnerGymSummaryDto> createGym(
            @CurrentUserId Long ownerId,
            @RequestBody GymCreateRequestDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gymService.createGym(ownerId, dto));
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/draft")
    public ResponseEntity<OwnerGymSummaryDto> getDraftGym(
            @CurrentUserId Long ownerId
    ) {
        return gymService.getDraftGym(ownerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/{gymId}")
    public ResponseEntity<OwnerGymSummaryDto> getGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(gymService.getGym(ownerId, gymId));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{gymId}")
    public ResponseEntity<OwnerGymSummaryDto> updateGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody GymUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(gymService.updateGym(ownerId, gymId, dto));
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/{gymId}/stats")
    public ResponseEntity<OwnerGymStatsDto> getGymStats(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(gymService.getGymStats(ownerId, gymId));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{gymId}/cancel")
    public ResponseEntity<Void> cancelDraftGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        gymService.cancelDraftGym(ownerId, gymId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{gymId}/finalize")
    public ResponseEntity<Void> finalizeGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        gymService.finalizeGym(ownerId, gymId);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/{gymId}/map")
    public ResponseEntity<Void> saveGymMap(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody SaveMapRequestDto dto
    ) {
        gymService.saveGymMap(ownerId, gymId, dto);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/{gymId}/map")
    public ResponseEntity<GymMapResponseDto> getGymMap(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        GymMapResponseDto mapDto = gymService.getGymMap(ownerId, gymId);
        if (mapDto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapDto);
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/{gymId}/equipments/manage")
    public ResponseEntity<List<OwnerGymEquipmentDto>> getGymEquipments(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(gymService.getGymEquipments(ownerId, gymId));
    }

}
