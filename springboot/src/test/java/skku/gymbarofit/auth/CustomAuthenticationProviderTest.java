package skku.gymbarofit.auth;

import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.SignupDto;
import skku.gymbarofit.repository.UserRepository;

import java.util.HashSet;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest
@Transactional
class CustomAuthenticationProviderTest {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    CustomUserDetailService userDetailsService;

    @Autowired
    CustomAuthenticationProvider customAuthenticationProvider;

    @Test
    public void 인증() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        Authentication authenticationToken = new UsernamePasswordAuthenticationToken(user.getEmail(), "1234");

        //when
        Authentication authentication = customAuthenticationProvider.authenticate(authenticationToken);

        //then
        assertThat(authentication.getPrincipal()).isEqualTo(userDetails);
        assertThat(new HashSet<>(authentication.getAuthorities()))
                .isEqualTo(new HashSet<>(userDetails.getAuthorities()));
        assertThat(authentication.getCredentials()).isEqualTo("1234");
    }

    @Test
    public void 인증_실패() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());

        Authentication authenticationToken = new UsernamePasswordAuthenticationToken(user.getEmail(), "5678");

        //when, then
        assertThrows(BadCredentialsException.class, ()->customAuthenticationProvider.authenticate(authenticationToken));
    }

    public static SignupDto getSignupDto() {
        return new SignupDto("kim", "test@example.com", "1234", "ADMIN", "01012345678", "신길동", "MALE");
    }
}