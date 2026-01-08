package skku.gymbarofit.api.user.dto;

import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.core.user.dto.UserRequestInfo;
import skku.gymbarofit.core.user.member.Member;

@Getter
@ToString
public class LoginResponseDto {

    private final JwtTokenDto token;
    private final UserRequestInfo userInfo;

    public LoginResponseDto(JwtTokenDto tokenDto, Member member) {
        this.token = tokenDto;
        this.userInfo = UserRequestInfo.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getUsername())
                .role(member.getRole().toString())
                .build();
    }
}
