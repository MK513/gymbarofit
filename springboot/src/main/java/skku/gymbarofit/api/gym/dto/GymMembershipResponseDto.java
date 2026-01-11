package skku.gymbarofit.api.gym.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.membership.Membership;

@Getter
@ToString
@Builder
public class GymMembershipResponseDto {

    private Long id;
    private String email;
    private String name;

    public static GymMembershipResponseDto of(Membership membership) {
        return GymMembershipResponseDto.builder()
                .id(membership.getMember().getId())
                .email(membership.getMember().getEmail())
                .name(membership.getMember().getUsername())
                .build();
    }
}
