package skku.gymbarofit.api.security.provider;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;

public abstract class AbstractAuthenticationProvider implements AuthenticationProvider {

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {

        String email = authentication.getName();
        String password = (String) authentication.getCredentials();

        CustomUserDetails customUserDetails = getCustomUserDetails(email, password);

        return new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
    }

    abstract CustomUserDetails getCustomUserDetails(String email, String password);
}
