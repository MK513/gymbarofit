package skku.gymbarofit.api.gym;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.membership.annotation.CurrentUserId;
import skku.gymbarofit.core.gym.dto.GymMembershipResponseDto;
import skku.gymbarofit.core.gym.dto.GymResponseDto;

import static org.springframework.data.domain.Sort.*;

@RestController
@RequestMapping("/gyms")
@RequiredArgsConstructor
public class GymApiController {

    private final GymService gymService;

    @GetMapping("/search")
    public Page<GymResponseDto> search(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "id", direction = Direction.DESC) Pageable pageable
    ) {
        return gymService.searchByKeyword(keyword, pageable);
    }

    @PostMapping("/{gymId}/memberships")
    public ResponseEntity<GymMembershipResponseDto> register(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {

        GymMembershipResponseDto response = gymService.register(memberId, gymId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
