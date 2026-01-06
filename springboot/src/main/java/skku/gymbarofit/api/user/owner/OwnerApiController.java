package skku.gymbarofit.api.user.owner;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.api.security.token.MemberUsernamePasswordAuthenticationToken;
import skku.gymbarofit.api.security.token.OwnerUsernamePasswordAuthenticationToken;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.core.dto.LoginRequestDto;
import skku.gymbarofit.core.dto.LoginResponseDto;
import skku.gymbarofit.core.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.dto.OwnerRegisterRequestDto;

@RestController
@RequiredArgsConstructor
@RequestMapping("/owners")
public class OwnerApiController {

    private final OwnerService ownerService;
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto,
            HttpServletResponse response
    ) {

        CustomUserDetails customUserDetails = authService.authenticateUser(
                new OwnerUsernamePasswordAuthenticationToken(
                        loginRequestDto.getEmail(),
                        loginRequestDto.getPassword()
                )
        );

        return ResponseEntity.ok(authService.createJwtToken(customUserDetails, response));
    }

    @PostMapping("/register")
    public ResponseEntity<OwnerDetailResponseDto> register(
            @RequestBody OwnerRegisterRequestDto registerRequestDto
    ) {
        return ResponseEntity.ok(ownerService.register(registerRequestDto));
    }
}
