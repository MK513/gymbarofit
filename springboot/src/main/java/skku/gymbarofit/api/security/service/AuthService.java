package skku.gymbarofit.api.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import skku.gymbarofit.api.security.exception.UserLoginException;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public CustomUserDetails authenticateUser(
            UsernamePasswordAuthenticationToken authenticationToken
    ) {
        Authentication authentication = Optional.ofNullable(authenticationManager.authenticate(authenticationToken))
                .orElseThrow(UserLoginException::new);

        SecurityContextHolder.getContext().setAuthentication(authentication);

        return (CustomUserDetails) authentication.getPrincipal();
    }
}
