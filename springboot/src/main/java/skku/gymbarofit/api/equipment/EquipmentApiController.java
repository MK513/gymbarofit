package skku.gymbarofit.api.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.global.annotation.CurrentUserId;

@RestController
@RequestMapping("/equipments")
@RequiredArgsConstructor
public class EquipmentApiController {

    private final EquipmentService equipmentService;

    // 대기 줄서기
    @PostMapping("/{equipmentId}/usages/wait")
    public ResponseEntity<Void> joinQueue(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.joinQueue(memberId, equipmentId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 대기 취소
    @PostMapping("/usages/{usageId}/cancel")
    public ResponseEntity<Void> leaveQueue(
            @PathVariable Long usageId
    ) {
        equipmentService.leaveQueue(usageId);
        return ResponseEntity.noContent().build();
    }

    // 대기 사용 전환
    @PostMapping("/usages/{usageId}/start")
    public ResponseEntity<Void> startUsage(
            @PathVariable Long usageId
    ) {
        equipmentService.startUsage(usageId);
        return ResponseEntity.noContent().build();
    }

    // 기구 사용 시작
    @PostMapping("/{equipmentId}/usages")
    public ResponseEntity<Void> createUsage(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.createUsage(memberId, equipmentId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 기구 사용 종료
    @PostMapping("/usages/{usageId}/end")
    public ResponseEntity<Void> endUsage(
            @PathVariable Long usageId
    ) {
        equipmentService.endUsage(usageId);
        return ResponseEntity.noContent().build();
    }



}
