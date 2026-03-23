package skku.gymbarofit.api.auth.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TokenRefreshRequestDto {
    // HttpOnly 쿠키를 사용할 수 없는 클라이언트(앱 등)의 fallback
    private String refreshToken;
}
