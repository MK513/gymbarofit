package skku.gymbarofit.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.repository.UserRepository;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static skku.gymbarofit.auth.CustomAuthenticationProviderTest.getSignupDto;

@SpringBootTest
@Transactional
class JwtTokenProviderTest {

    @Autowired JwtTokenProvider jwtTokenProvider;
    @Autowired CustomUserDetailService customUserDetailService;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired UserRepository userRepository;

    @Test
    public void jwt토큰_생성() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());

        //when
        String token = jwtTokenProvider.createToken(userDetails);

        //then
        assertThat(token).isNotNull();

        Claims claims = jwtTokenProvider.getClaims(token);
        assertThat(claims.getSubject()).isEqualTo(user.getEmail());
        assertThat(claims.get("role", String.class)).isEqualTo("ROLE_" + user.getRole());

    }

    @Test
    public void jwt토큰_검증() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());
        String token = jwtTokenProvider.createToken(userDetails);

        //when
        boolean val = jwtTokenProvider.validateToken(token);

        //when, then
        assertThat(Boolean.TRUE).isEqualTo(val);
    }

    @Test
    public void jwt토큰_검증_실패() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());

        //when
        String token = jwtTokenProvider.createToken(userDetails) + "123";

        //then
        assertThrows(JwtException.class, ()-> jwtTokenProvider.validateToken(token));
    }

    @Test
    public void jwt토큰_claims가져오기() throws Exception {
        //given
        User user = User.createUser(getSignupDto(), passwordEncoder);
        userRepository.save(user);

        UserDetails userDetails = customUserDetailService.loadUserByUsername(user.getEmail());
        String token = jwtTokenProvider.createToken(userDetails);

        //when
        Claims claims = jwtTokenProvider.getClaims(token);

        //then
        assertThat(claims.getSubject()).isEqualTo(user.getEmail());
        assertThat(claims.get("role", String.class)).isEqualTo("ROLE_" + user.getRole());
    }
}