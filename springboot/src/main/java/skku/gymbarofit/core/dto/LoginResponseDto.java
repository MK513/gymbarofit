package skku.gymbarofit.core.dto;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class LoginResponseDto {

    private String accessToken;
    private String tokenType;
    private Long expiryDuration;

    public LoginResponseDto(String accessToken, Long expiryDuration) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiryDuration = expiryDuration;
    }
}
