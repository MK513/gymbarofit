package skku.gymbarofit.api.membership;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
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

    @PostMapping("/register")
    public ResponseEntity<MembershipRegisterResponseDto> register(
            @RequestBody MembershipRegisterRequestDto membershipRegisterRequestDto,
            @AuthenticationPrincipal CustomUserDetails principal
    ) {

        MembershipRegisterResponseDto response = membershipService.register(principal.getUserContext(), membershipRegisterRequestDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
