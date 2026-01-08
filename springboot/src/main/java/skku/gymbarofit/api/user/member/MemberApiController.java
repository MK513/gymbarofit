package skku.gymbarofit.api.user.member;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.core.user.dto.LoginRequestDto;
import skku.gymbarofit.api.user.dto.LoginResponseDto;
import skku.gymbarofit.core.user.member.dto.MemberDetailResponseDto;
import skku.gymbarofit.core.user.member.dto.MemberRegisterRequestDto;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberApiController {

    private final MemberService memberService;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto
    ) {
        return ResponseEntity.ok(memberService.login(loginRequestDto));
    }

    @PostMapping("/register")
    public ResponseEntity<MemberDetailResponseDto> register(
            @RequestBody MemberRegisterRequestDto registerRequestDto
    ) {
        return ResponseEntity.ok(memberService.register(registerRequestDto));
    }

}
