package skku.gymbarofit.api.gym;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.equipment.EquipmentService;
import skku.gymbarofit.core.item.equipment.dto.EquipmentListResponseDto;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.core.gym.dto.GymDetailResponseDto;

import static org.springframework.data.domain.Sort.*;

@RestController
@RequestMapping("/gyms")
@RequiredArgsConstructor
public class GymApiController {

    private final GymService gymService;
    private final EquipmentService equipmentService;

    @GetMapping("/search")
    public Page<GymDetailResponseDto> search(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "id", direction = Direction.DESC) Pageable pageable
    ) {
        return gymService.searchByKeyword(keyword, pageable);
    }

    @PostMapping("/{gymId}/memberships")
    public ResponseEntity<GymDetailResponseDto> register(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {

        GymDetailResponseDto response = gymService.register(memberId, gymId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{gymId}/equipments")
    public ResponseEntity<EquipmentListResponseDto> getEquipments(
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(equipmentService.getEquipments(gymId));
    }


}
