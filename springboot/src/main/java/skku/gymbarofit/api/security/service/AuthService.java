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

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

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
}
