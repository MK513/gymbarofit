package skku.gymbarofit.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.repository.UserRepository;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static skku.gymbarofit.auth.CustomAuthenticationProviderTest.getSignupDto;

@SpringBootTest
@Transactional
class CustomUserDetailServiceTest {

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    CustomUserDetailService customUserDetailService;

    @Autowired
    UserRepository userRepository;

    @Test
    public void UserDetails_생성() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        //when
        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());

        //then
        assertThat(userDetails.getPassword()).isEqualTo(user.getPassword());
    }

    @Test
    public void UserDetails_생성_실패() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        //when, then
        assertThrows(UsernameNotFoundException.class, () -> customUserDetailService.loadUserByUsername("non_exist@test.com"));
    }
}