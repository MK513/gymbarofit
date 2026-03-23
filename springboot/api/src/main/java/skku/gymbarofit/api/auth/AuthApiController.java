package skku.gymbarofit.api.auth;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.auth.dto.TokenRefreshRequestDto;
import skku.gymbarofit.api.auth.dto.TokenRefreshResponseDto;
import skku.gymbarofit.api.security.exception.RefreshTokenException;
import skku.gymbarofit.api.security.exception.code.SecurityErrorCode;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.api.security.service.AuthService.RefreshResult;

import java.time.Duration;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthApiController {

    private final AuthService authService;

    @Value("${app.jwt.refresh-token.expireTime}")
    private long refreshTokenExpireMillis;

    @Value("${app.jwt.refresh-token.secure-cookie}")
    private boolean secureCookie;

    /**
     * Access Token 재발급
     * 쿠키 우선, 없으면 body의 refreshToken 사용
     */
    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponseDto> refresh(
            @CookieValue(name = "refreshToken", required = false) String cookieToken,
            @RequestBody(required = false) TokenRefreshRequestDto body,
            HttpServletResponse response
    ) {
        String rawToken = resolveToken(cookieToken, body);
        RefreshResult result = authService.refreshTokens(rawToken);

        setRefreshTokenCookie(response, result.newRawRefreshToken());
        return ResponseEntity.ok(new TokenRefreshResponseDto(result.accessToken()));
    }

    /**
     * 로그아웃 - Refresh Token 무효화 및 쿠키 삭제
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = "refreshToken", required = false) String cookieToken,
            @RequestBody(required = false) TokenRefreshRequestDto body,
            HttpServletResponse response
    ) {
        String rawToken = resolveToken(cookieToken, body);
        authService.revokeRefreshToken(rawToken);
        clearRefreshTokenCookie(response);
        return ResponseEntity.ok().build();
    }

    private String resolveToken(String cookieToken, TokenRefreshRequestDto body) {
        if (cookieToken != null && !cookieToken.isBlank()) {
            return cookieToken;
        }
        if (body != null && body.getRefreshToken() != null && !body.getRefreshToken().isBlank()) {
            return body.getRefreshToken();
        }
        throw new RefreshTokenException(SecurityErrorCode.INVALID_REFRESH_TOKEN);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String rawToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", rawToken)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/auth")
                .maxAge(Duration.ofMillis(refreshTokenExpireMillis))
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secureCookie)
                .path("/auth")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
