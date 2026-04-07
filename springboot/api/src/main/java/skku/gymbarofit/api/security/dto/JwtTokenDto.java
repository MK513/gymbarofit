package skku.gymbarofit.api.security.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.ToString;

import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Getter
@ToString
public class JwtTokenDto {

    private String accessToken;

    private String tokenType;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ssXXX", timezone = "Asia/Seoul")
    private OffsetDateTime expiresAt;

    public JwtTokenDto(String accessToken, OffsetDateTime expiresAt) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresAt = expiresAt;
    }
}
