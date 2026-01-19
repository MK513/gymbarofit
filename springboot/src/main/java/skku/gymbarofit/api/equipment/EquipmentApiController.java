package skku.gymbarofit.api.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.membership.annotation.CurrentUserId;

@RestController
@RequestMapping("/equipments")
@RequiredArgsConstructor
public class EquipmentApiController {

    private final EquipmentService equipmentService;

    // 대기 줄서기
    @PostMapping("/{equipmentId}/queue")
    public ResponseEntity<Void> joinQueue(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.joinQueue(memberId, equipmentId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 대기 취소
    @DeleteMapping("/{equipmentId}/queue")
    public ResponseEntity<Void> leftQueue(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.leftQueue(memberId, equipmentId);
        return ResponseEntity.noContent().build();
    }

    // 기구 사용 시작
    @PostMapping("/{equipmentId}/usage")
    public ResponseEntity<Void> startUsage(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.startUsage(memberId, equipmentId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    // 기구 사용 종료
    @DeleteMapping("/{equipmentId}/usage")
    public ResponseEntity<Void> endUsage(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.endUsage(memberId, equipmentId);
        return ResponseEntity.noContent().build();
    }

}
