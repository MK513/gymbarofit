package skku.gymbarofit.api.membership;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.core.membership.dto.MembershipInfoResponseDto;

@RestController
@RequestMapping("/memberships")
@RequiredArgsConstructor
public class MembershipApiController {

    private final MembershipService membershipService;

    @GetMapping("/{gymId}/info")
    public ResponseEntity<MembershipInfoResponseDto> getInfo(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(membershipService.getInfo(gymId, memberId));
    }
}
