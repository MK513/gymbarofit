package skku.gymbarofit.api.security.service;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.core.user.dto.LoginResponseDto;

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


    public LoginResponseDto createJwtToken(CustomUserDetails customUserDetails, HttpServletResponse response) {
        String jwtAccessToken = jwtTokenProvider.generateAccessToken(customUserDetails, response);

        return new LoginResponseDto(jwtAccessToken, jwtTokenProvider.getAccessTokenExpiryDuration());
    }
}
