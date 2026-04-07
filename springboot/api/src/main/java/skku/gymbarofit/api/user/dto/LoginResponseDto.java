package skku.gymbarofit.api.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymDetailResponseDto;
import skku.gymbarofit.core.user.dto.UserRequestInfo;
import skku.gymbarofit.core.user.enums.UserRole;
import skku.gymbarofit.core.user.member.Member;

@Getter
@ToString
public class LoginResponseDto {

    private final UserRequestInfo userInfo;
    private final JwtTokenDto token;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final String refreshToken;

    public LoginResponseDto(JwtTokenDto tokenDto, Member member, Gym gym, String rawRefreshToken) {
        this.token = tokenDto;
        this.refreshToken = rawRefreshToken;
        this.userInfo = UserRequestInfo.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getUsername())
                .role(UserRole.MEMBER.name())
                .gym(GymDetailResponseDto.from(gym))
                .build();
    }
}
