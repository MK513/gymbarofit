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
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    @Value("${app.jwt.secretKey}")
    private String secretKey;

    @Value("${app.jwt.header.name}")
    private String tokenRequestHeader;

    @Value("${app.jwt.header.prefix}")
    private String tokenRequestHeaderPrefix;

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        try {

            String header = request.getHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                chain.doFilter(request, response);
                return;
            }


            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                String jwt = getJwtTokenFromRequest(request);

                log.warn("JWT Token Validation Succeeded. {}", jwt);

                if (StringUtils.hasText(jwt)) {
//                    String clientUuid = getClientUuid(request);
//                    String userAgent = request.getHeader("User-Agent");

                    CustomUserDetails userDetails = jwtTokenProvider.getUserDetailsFromJwt(jwt);

                    Authentication authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

        } catch (Exception e) {
            log.error("JWT Token Validation Failed: {}", e.getMessage());
            throw new RuntimeException(e);
        }

        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.equals("/error")
                || path.equals("/members/login")
                || path.equals("/members/register")
                || path.equals("/owners/login")
                || path.equals("/owners/register");
    }

    private String getJwtTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");

        if (StringUtils.hasText(authHeader) && authHeader.startsWith(tokenRequestHeaderPrefix)) {
            return authHeader.substring(7).trim();
        }
        return null;
    }

    public String getClientIp(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");

        if (clientIp == null) {
            clientIp = request.getRemoteAddr();
        }

        return clientIp;
    }

//    public String getClientUuid(HttpServletRequest request) {
//        String clientUuid = null;
//
//        Cookie[] cookies = request.getCookies();
//        if (cookies != null) {
//            for (Cookie cookie : cookies) {
//                if (cookie.getName().equals(JwtTokenProvider.CLIENT_UUID)) {
//                    clientUuid = cookie.getValue();
//                }
//            }
//        }
//
//        if (clientUuid == null) {
//            throw new JwtContextException();
//        }
//
//        return clientUuid;
//    }

}
