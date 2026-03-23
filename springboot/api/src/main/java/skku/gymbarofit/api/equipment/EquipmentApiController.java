package skku.gymbarofit.api.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.user.owner.dto.EquipmentCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.EquipmentUpdateRequestDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymEquipmentDto;
import skku.gymbarofit.api.global.annotation.CurrentUserId;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/equipments")
@RequiredArgsConstructor
public class EquipmentApiController {

    private final EquipmentService equipmentService;

    // 대기 줄서기
    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/{equipmentId}/usages/wait")
    public ResponseEntity<Map<String, Long>> joinQueue(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        Long usageId = equipmentService.joinQueue(memberId, equipmentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("usageId", usageId));
    }

    // 대기 취소
    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/usages/{usageId}/cancel")
    public ResponseEntity<Void> leaveQueue(
            @PathVariable Long usageId
    ) {
        equipmentService.leaveQueue(usageId);
        return ResponseEntity.noContent().build();
    }

    // 대기 사용 전환
    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/usages/{usageId}/start")
    public ResponseEntity<Void> startUsage(
            @PathVariable Long usageId
    ) {
        equipmentService.startUsage(usageId);
        return ResponseEntity.noContent().build();
    }

    // 기구 사용 시작
    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/{equipmentId}/usages")
    public ResponseEntity<Map<String, Long>> createUsage(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        Long usageId = equipmentService.createUsage(memberId, equipmentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("usageId", usageId));
    }

    // 기구 사용 종료
    @PreAuthorize("hasRole('MEMBER')")
    @PostMapping("/usages/{usageId}/end")
    public ResponseEntity<Void> endUsage(
            @PathVariable Long usageId
    ) {
        equipmentService.endUsage(usageId);
        return ResponseEntity.noContent().build();
    }

    // 기구 상태 변경
    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{equipmentId}/status")
    public ResponseEntity<OwnerGymEquipmentDto> updateEquipmentStatus(
            @PathVariable Long equipmentId,
            @RequestBody EquipmentStatusUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(equipmentService.updateStatus(equipmentId, dto));
    }

    // ─── 오너용 Equipment 관리 ──────────────────────────────────────────────────

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/{gymId}")
    public ResponseEntity<List<Long>> addEquipments(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody EquipmentCreateRequestDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipmentService.addEquipments(ownerId, gymId, dto));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{equipmentId}")
    public ResponseEntity<OwnerGymEquipmentDto> updateEquipment(
            @CurrentUserId Long ownerId,
            @PathVariable Long equipmentId,
            @RequestBody EquipmentUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(equipmentService.updateEquipment(ownerId, equipmentId, dto));
    }

    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/{equipmentId}")
    public ResponseEntity<Void> deleteEquipment(
            @CurrentUserId Long ownerId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.deleteEquipment(ownerId, equipmentId);
        return ResponseEntity.noContent().build();
    }
}
