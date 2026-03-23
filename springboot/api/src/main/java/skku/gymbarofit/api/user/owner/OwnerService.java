package skku.gymbarofit.api.user.owner;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.api.security.token.OwnerUsernamePasswordAuthenticationToken;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.api.user.dto.OwnerLoginResponseDto;
import skku.gymbarofit.api.user.dto.LoginRequestDto;
import skku.gymbarofit.core.user.owner.Owner;
import skku.gymbarofit.core.user.owner.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.user.owner.dto.OwnerRegisterRequestDto;
import skku.gymbarofit.core.user.owner.service.OwnerInternalService;

@Transactional
@Service
@RequiredArgsConstructor
public class OwnerService {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final OwnerInternalService ownerInternalService;
    private final AuthService authService;

    public OwnerDetailResponseDto register(OwnerRegisterRequestDto requestDto) {
        String encodedPassword = bCryptPasswordEncoder.encode(requestDto.getPassword());
        Owner owner = ownerInternalService.save(requestDto, encodedPassword);
        return OwnerDetailResponseDto.of(owner);
    }

    public OwnerLoginResponseDto login(LoginRequestDto dto) {
        CustomUserDetails userDetails = authService.authenticateUser(
                new OwnerUsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );
        JwtTokenDto jwtToken = authService.createJwtToken(userDetails);
        String rawRefreshToken = authService.issueRefreshToken(userDetails);
        Owner owner = ownerInternalService.findByEmail(dto.getEmail());
        return new OwnerLoginResponseDto(jwtToken, owner, rawRefreshToken);
    }
}
