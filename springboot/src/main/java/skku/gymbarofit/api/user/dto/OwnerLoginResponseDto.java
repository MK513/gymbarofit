package skku.gymbarofit.api.user.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.core.user.dto.UserRequestInfo;
import skku.gymbarofit.core.user.enums.UserRole;
import skku.gymbarofit.core.user.owner.Owner;

@Getter
public class OwnerLoginResponseDto {

    private final UserRequestInfo userInfo;
    private final JwtTokenDto token;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private final String refreshToken;

    public OwnerLoginResponseDto(JwtTokenDto tokenDto, Owner owner, String rawRefreshToken) {
        this.token = tokenDto;
        this.refreshToken = rawRefreshToken;
        this.userInfo = UserRequestInfo.builder()
                .id(owner.getId())
                .email(owner.getEmail())
                .name(owner.getUsername())
                .role(UserRole.OWNER.name())
                .gym(null)
                .build();
    }
}
