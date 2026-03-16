package skku.gymbarofit.api.auth.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import skku.gymbarofit.api.security.dto.JwtTokenDto;

import java.time.OffsetDateTime;

@Getter
public class TokenRefreshResponseDto {

    private final String accessToken;
    private final String tokenType;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX", timezone = "Asia/Seoul")
    private final OffsetDateTime expiresAt;

    public TokenRefreshResponseDto(JwtTokenDto jwtTokenDto) {
        this.accessToken = jwtTokenDto.getAccessToken();
        this.tokenType = jwtTokenDto.getTokenType();
        this.expiresAt = jwtTokenDto.getExpiresAt();
    }
}
