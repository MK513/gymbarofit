package skku.gymbarofit.api.membership;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.membership.annotation.CurrentUserId;
import skku.gymbarofit.core.membership.dto.MembershipInfoResponseDto;

@RestController
@RequestMapping("/memberships")
@RequiredArgsConstructor
public class MembershipApiController {

    private final MembershipService membershipService;

    @GetMapping("/{gymId}/info")
    public ResponseEntity<MembershipInfoResponseDto> info(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(membershipService.info(gymId, memberId));
    }
}
