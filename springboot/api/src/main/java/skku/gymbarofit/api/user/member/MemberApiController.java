package skku.gymbarofit.api.user.member;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.core.usage.equipment.dto.WorkoutHistoryResponseDto;
import skku.gymbarofit.api.user.dto.LoginRequestDto;
import skku.gymbarofit.api.user.dto.LoginResponseDto;
import skku.gymbarofit.core.user.member.dto.MemberDetailResponseDto;
import skku.gymbarofit.core.user.member.dto.MemberRegisterRequestDto;

import java.time.Duration;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberApiController {

    private final MemberService memberService;
    private final AuthService authService;

    @Value("${app.jwt.refresh-token.expireTime}")
    private long refreshTokenExpireMillis;

    @Value("${app.jwt.refresh-token.secure-cookie}")
    private boolean secureCookie;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto,
            HttpServletResponse response
    ) {
        LoginResponseDto dto = memberService.login(loginRequestDto);
        setRefreshTokenCookie(response, dto.getRefreshToken());
        return ResponseEntity.ok(dto);
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

    @PostMapping("/register")
    public ResponseEntity<MemberDetailResponseDto> register(
            @RequestBody MemberRegisterRequestDto registerRequestDto
    ) {
        return ResponseEntity.ok(memberService.register(registerRequestDto));
    }

    @GetMapping("/history")
    public ResponseEntity<WorkoutHistoryResponseDto> getWorkoutHistory(
            @CurrentUserId Long memberId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(memberService.getWorkoutHistory(memberId, year, month));
    }

}
