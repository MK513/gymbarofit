package skku.gymbarofit.api.security.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.security.UserContext;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.api.security.service.UserValidateService;
import skku.gymbarofit.api.security.token.OwnerUsernamePasswordAuthenticationToken;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.core.service.OwnerInternalService;
import skku.gymbarofit.core.user.Owner;

@Component
@RequiredArgsConstructor
public class OwnerAuthenticationProvider extends AbstractAuthenticationProvider{

    private final OwnerInternalService ownerInternalService;
    private final UserValidateService userValidateService;

    public CustomUserDetails getCustomUserDetails(String email, String password) {

        Owner owner = ownerInternalService.findByEmail(email);
        userValidateService.validateUser(owner, password);

        return new CustomUserDetails(new UserContext(owner.getId(), owner.getEmail(), owner.getRole()));
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(OwnerUsernamePasswordAuthenticationToken.class);
    }
}
