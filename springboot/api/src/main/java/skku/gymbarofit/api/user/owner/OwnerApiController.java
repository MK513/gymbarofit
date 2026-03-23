package skku.gymbarofit.api.user.owner;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import skku.gymbarofit.api.user.dto.OwnerLoginResponseDto;
import skku.gymbarofit.api.user.dto.LoginRequestDto;
import skku.gymbarofit.core.user.owner.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.user.owner.dto.OwnerRegisterRequestDto;

@RestController
@RequiredArgsConstructor
@RequestMapping("/owners")
public class OwnerApiController {

    private final OwnerService ownerService;

    @Value("${app.jwt.refresh-token.expireTime}")
    private long refreshTokenExpireMillis;

    @Value("${app.jwt.refresh-token.secure-cookie}")
    private boolean secureCookie;

    @PostMapping("/login")
    public ResponseEntity<OwnerLoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto,
            HttpServletResponse response
    ) {
        OwnerLoginResponseDto dto = ownerService.login(loginRequestDto);
        setRefreshTokenCookie(response, dto.getRefreshToken());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/register")
    public ResponseEntity<OwnerDetailResponseDto> register(
            @RequestBody OwnerRegisterRequestDto registerRequestDto
    ) {
        return ResponseEntity.ok(ownerService.register(registerRequestDto));
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
}
