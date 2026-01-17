package skku.gymbarofit.api.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.api.membership.annotation.CurrentUserId;

@RestController
@RequestMapping("/equipments")
@RequiredArgsConstructor
public class EquipmentApiController {

    private final EquipmentService equipmentService;

    // 2. 줄서기 (Waiting)
    @PostMapping("/{equipmentId}/queue")
    public ResponseEntity<Void> joinQueue(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.joinQueue(memberId, equipmentId);
        return ResponseEntity.ok().build();
    }

    // 기구 사용 시작
    @PostMapping("/{equipmentId}/start")
    public ResponseEntity<Void> startUsage(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.startUsage(memberId, equipmentId);
        return ResponseEntity.ok().build();
    }

    // 기구 사용 종료
    @PostMapping("/{equipmentId}/end")
    public ResponseEntity<Void> endUsage(
            @CurrentUserId Long memberId,
            @PathVariable Long equipmentId
    ) {
        equipmentService.endUsage(memberId, equipmentId);
        return ResponseEntity.ok().build();
    }

}
