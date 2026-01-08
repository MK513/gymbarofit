package skku.gymbarofit.api.user.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.api.security.token.MemberUsernamePasswordAuthenticationToken;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.core.user.dto.LoginRequestDto;
import skku.gymbarofit.api.user.dto.LoginResponseDto;
import skku.gymbarofit.core.user.member.dto.MemberDetailResponseDto;
import skku.gymbarofit.core.user.member.dto.MemberRegisterRequestDto;
import skku.gymbarofit.core.user.member.service.MemberInternalService;
import skku.gymbarofit.core.user.member.Member;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberInternalService memberInternalService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final AuthService authService;

    public MemberDetailResponseDto register(MemberRegisterRequestDto requestDto) {
        String encodedPassword = bCryptPasswordEncoder.encode(requestDto.getPassword());

        Member member = memberInternalService.save(requestDto, encodedPassword);

        return MemberDetailResponseDto.of(member);
    }

    public LoginResponseDto login(LoginRequestDto loginRequestDto) {

        CustomUserDetails customUserDetails = authService.authenticateUser(
                new MemberUsernamePasswordAuthenticationToken(
                        loginRequestDto.getEmail(),
                        loginRequestDto.getPassword()
                )
        );

        JwtTokenDto jwtToken = authService.createJwtToken(customUserDetails);
        Member member = memberInternalService.findByEmail(loginRequestDto.getEmail());

        return new LoginResponseDto(jwtToken, member);
    }

}
