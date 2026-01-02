package skku.gymbarofit.api.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;
import skku.gymbarofit.api.security.userdetail.CustomUserDetailService;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;

import java.io.IOException;

@Slf4j
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    @Value("${jwt.secretKey}")
    private String secretKey;

    private final CustomUserDetailService customUserDetailService;

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String jwtHeader = request.getHeader("Authorization");

        // JWT 토큰 유무 확인
        if (jwtHeader == null || !jwtHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = jwtHeader.replace("Bearer ", "");

        if (jwtTokenProvider.validateToken(token)) {
            String email = jwtTokenProvider.getClaims(token).getSubject();

            log.info("parsed email : {} ", email);
            log.info("token : {}", token);

            UserDetails userDetails = customUserDetailService.loadUserByUsername(email);

            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        chain.doFilter(request, response);
    }

}
