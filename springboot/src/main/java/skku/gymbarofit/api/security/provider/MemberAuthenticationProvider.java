package skku.gymbarofit.api.security.provider;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.security.UserContext;
import skku.gymbarofit.api.security.service.UserValidateService;
import skku.gymbarofit.api.security.token.MemberUsernamePasswordAuthenticationToken;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.core.user.enums.UserRole;
import skku.gymbarofit.core.user.member.service.MemberInternalService;
import skku.gymbarofit.core.user.member.Member;

@Component
@RequiredArgsConstructor
public class MemberAuthenticationProvider extends AbstractAuthenticationProvider{

    private final MemberInternalService memberInternalService;
    private final UserValidateService userValidateService;

    public CustomUserDetails getCustomUserDetails(String email, String password) {

        // 비밀번호 일치 검증
        Member member = memberInternalService.findByEmail(email);
        userValidateService.validateUser(member, password);

        return new CustomUserDetails(new UserContext(member.getId(), member.getEmail(), UserRole.MEMBER));
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(MemberUsernamePasswordAuthenticationToken.class);
    }
}
