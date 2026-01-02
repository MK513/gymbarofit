package skku.gymbarofit.api.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;
import skku.gymbarofit.core.user.User;
import skku.gymbarofit.core.dto.LoginDto;
import skku.gymbarofit.core.exception.BusinessException;
import skku.gymbarofit.core.exception.ErrorCode;
import skku.gymbarofit.core.repository.UserRepository;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public CustomAuthenticationFilter(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, UserRepository userRepository) {
        super.setAuthenticationManager(authenticationManager);
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    /**
     * attemptAuthentication 인증 성공시 실행
     * JWT 토큰 생성하여 사용자에게 반환
     */
    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        UserDetails userDetails = (UserDetails) authResult.getPrincipal();

        String jwtToken = jwtTokenProvider.generateAccessToken(userDetails);
        User findUser = userRepository.findByEmail(userDetails.getUsername())
                        .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_FOUND));


        response.addHeader("Authorization", "Bearer " + jwtToken);
        response.setContentType("application/json");

        Map<String, Object> body = new HashMap<>();
        body.put("accessToken", jwtToken);
        body.put("name", findUser.getName());
        body.put("role", findUser.getRole());

        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getWriter(), body);
    }

    /**
     * object(UserDetails) 를 AuthenticationManger(CustomAuthenticationProvider)에 전달
     */
    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        UsernamePasswordAuthenticationToken authRequest;

        try {
            authRequest = getAuthRequest(request);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        //UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        return this.getAuthenticationManager().authenticate(authRequest);
    }

    /**
     * login 정보에 따른 UsernamePasswordAuthenticationToken 생성
     */
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
