package skku.gymbarofit.api.user.dto;

import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.membership.Membership;
import skku.gymbarofit.core.user.dto.UserRequestInfo;
import skku.gymbarofit.core.user.enums.UserRole;
import skku.gymbarofit.core.user.member.Member;

import java.util.List;

@Getter
@ToString
public class LoginResponseDto {

    private final UserRequestInfo userInfo;
    private final JwtTokenDto token;

    public LoginResponseDto(JwtTokenDto tokenDto, Member member, Gym gym) {
        this.token = tokenDto;
        this.userInfo = UserRequestInfo.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getUsername())
                .role(UserRole.MEMBER.name())
                .gym(GymResponseDto.from(gym))
                .build();
    }
}
