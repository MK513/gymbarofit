package skku.gymbarofit.api.membership;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
<<<<<<< HEAD
import skku.gymbarofit.api.membership.dto.GymMemberResponseDto;
import skku.gymbarofit.core.membership.dto.MembershipInfoResponseDto;

import java.util.List;

=======
import skku.gymbarofit.core.membership.dto.MembershipInfoResponseDto;

>>>>>>> origin/main
@RestController
@RequestMapping("/memberships")
@RequiredArgsConstructor
public class MembershipApiController {

    private final MembershipService membershipService;

<<<<<<< HEAD
    @GetMapping("/gyms/{gymId}/info")
=======
    @GetMapping("/{gymId}/info")
>>>>>>> origin/main
    public ResponseEntity<MembershipInfoResponseDto> getInfo(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(membershipService.getInfo(gymId, memberId));
    }
<<<<<<< HEAD

    @GetMapping("/gyms/{gymId}/members")
    public ResponseEntity<List<GymMemberResponseDto>> getGymMembers(
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(membershipService.getGymMembers(gymId));
    }

    @DeleteMapping("/gyms/{gymId}/members/{memberId}")
    public ResponseEntity<Void> deleteGymMember(
            @PathVariable Long gymId,
            @PathVariable Long memberId
    ) {
        membershipService.deleteGymMember(gymId, memberId);
        return ResponseEntity.noContent().build();
    }
=======
>>>>>>> origin/main
}
