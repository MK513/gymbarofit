package skku.gymbarofit.api.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.api.token.RefreshTokenService;
import skku.gymbarofit.api.token.RefreshTokenService.RotationResult;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    public CustomUserDetails authenticateUser(
            UsernamePasswordAuthenticationToken authenticationToken
    ) {

        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return (CustomUserDetails) authentication.getPrincipal();
    }


    public JwtTokenDto createJwtToken(CustomUserDetails customUserDetails) {
        String jwtAccessToken = jwtTokenProvider.generateAccessToken(customUserDetails);
        OffsetDateTime expiresAt = jwtTokenProvider.getExpiresAt(jwtAccessToken);

        return new JwtTokenDto(jwtAccessToken, expiresAt);
    }

    public String issueRefreshToken(CustomUserDetails customUserDetails) {
        return refreshTokenService.issueRefreshToken(
                customUserDetails.getUserContext().getId(),
                customUserDetails.getUserContext().getRole()
        );
    }

    public RefreshResult refreshTokens(String rawRefreshToken) {
        RotationResult rotation = refreshTokenService.validateAndRotate(rawRefreshToken);
        CustomUserDetails userDetails = new CustomUserDetails(rotation.userContext());
        JwtTokenDto newAccessToken = createJwtToken(userDetails);
        return new RefreshResult(newAccessToken, rotation.newRawToken());
    }

    public void revokeRefreshToken(String rawRefreshToken) {
        refreshTokenService.revokeByRawToken(rawRefreshToken);
    }

    public record RefreshResult(JwtTokenDto accessToken, String newRawRefreshToken) {}
}
