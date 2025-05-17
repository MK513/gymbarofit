package skku.gymbarofit.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ClaimsBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import skku.gymbarofit.dto.LoginDto;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Date;
import java.util.Optional;

public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
    @Value("${jwt.secretKey}")
    private String secretKey;

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 1일


    public CustomAuthenticationFilter(AuthenticationManager authenticationManager) {
        super.setAuthenticationManager(authenticationManager);
    }

    /**
     * attemptAuthentication 인증 성공시 실행
     * JWT 토큰 생성하여 사용자에게 반환
     */
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        UserDetails userDetails = (UserDetails) authResult.getPrincipal();
        ClaimsBuilder claims = Jwts.claims().subject(userDetails.getUsername());

        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + EXPIRATION_TIME);

        Optional<String> role = userDetails.getAuthorities()
                .stream().map(GrantedAuthority::getAuthority)
                .findAny();

        String jwtToken = Jwts.builder()
                .header()
                .add("typ", "JWT")
                .add("alg", "HS256")
                .add("regDate", System.currentTimeMillis())
                .and()
                .claims()
                .add("role", role)
                .and()
                .subject(String.valueOf(userDetails.getUsername()))
                .signWith(getKey(), Jwts.SIG.HS256) // JWT 서명 발급
                .expiration(accessExpiration)
                .compact();


        response.addHeader("Authorization", "Bearer " + jwtToken);

    }

    // secret key 객체 생성
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    // object(UserDetails) 를 AuthenticationManger(CustomAuthenticationProvider)에 전달
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        UsernamePasswordAuthenticationToken authRequest;

        try {
            authRequest = getAuthRequest(request);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        //UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return getAuthenticationManager().authenticate(authRequest);
    }

    // login 정보에 따른 UsernamePasswordAuthenticationToken 생성
    public UsernamePasswordAuthenticationToken getAuthRequest(HttpServletRequest request) throws Exception{
        try {
            ObjectMapper om = new ObjectMapper();
            LoginDto loginDto = om.readValue(request.getInputStream(), LoginDto.class);

            return new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword());
        } catch (UsernameNotFoundException e) {
            throw new UsernameNotFoundException(e.getMessage());
        } catch (Exception e) {
            throw new Exception(e.getMessage(), e.getCause());
        }
    }
}
