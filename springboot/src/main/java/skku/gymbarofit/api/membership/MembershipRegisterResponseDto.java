package skku.gymbarofit.api.membership;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.membership.Membership;

@Getter
@ToString
@Builder
public class MembershipRegisterResponseDto {

    private Long id;
    private String email;
    private String name;

    public static MembershipRegisterResponseDto of(Membership membership) {
        return MembershipRegisterResponseDto.builder()
                .id(membership.getMember().getId())
                .email(membership.getMember().getEmail())
                .name(membership.getMember().getUsername())
                .build();
    }
}
