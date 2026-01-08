package skku.gymbarofit.api.membership;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.api.membership.dto.MembershipResponseDto;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;

@RestController
@RequestMapping("/memberships")
@RequiredArgsConstructor
public class MembershipApiController {

    private final MembershipService membershipService;

    @GetMapping("/info")
    public ResponseEntity<MembershipResponseDto> info( @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(membershipService.info(principal.getUserContext()));
    }
}
