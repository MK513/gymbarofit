package skku.gymbarofit.api.user.dto;

import lombok.Getter;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.core.user.dto.UserRequestInfo;
import skku.gymbarofit.core.user.enums.UserRole;
import skku.gymbarofit.core.user.owner.Owner;

@Getter
public class OwnerLoginResponseDto {

    private final UserRequestInfo userInfo;
    private final JwtTokenDto token;

    public OwnerLoginResponseDto(JwtTokenDto tokenDto, Owner owner) {
        this.token = tokenDto;
        this.userInfo = UserRequestInfo.builder()
                .id(owner.getId())
                .email(owner.getEmail())
                .name(owner.getUsername())
                .role(UserRole.OWNER.name())
                .gym(null)
                .build();
    }
}
