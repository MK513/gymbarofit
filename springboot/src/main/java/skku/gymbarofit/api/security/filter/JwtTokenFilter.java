package skku.gymbarofit.api.security.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import skku.gymbarofit.api.security.userdetail.CustomUserDetailService;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;

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

    private final CustomUserDetailService customUserDetailService;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain
    ) throws ServletException, IOException {

        try {

            if (SecurityContextHolder.getContext().getAuthentication() == null) {

                String jwt = getJwtTokenFromRequest(request);

                if (StringUtils.hasText(jwt)) {
                    String clientIp = getClientIp(request);
                    String clientUuid = getClientUuid(request);
                    String userAgent = request.getHeader("User-Agent");

                    jwtTokenProvider.get
                    UserDetails userDetails = customUserDetailService.loadUserByUsername(email);

                    Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        chain.doFilter(request, response);
    }

    private String getJwtTokenFromRequest(HttpServletRequest request) {
        String rawToken = request.getHeader("Authorization");

        if (StringUtils.hasText(rawToken) && rawToken.startsWith(tokenRequestHeaderPrefix)) {
            log.info("Extracted Token: " + rawToken);
            return rawToken.replace(tokenRequestHeaderPrefix, "");
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

    public String getClientUuid(HttpServletRequest request) {
        String clientUuid = null;

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(JwtTokenProvider.CLIENT_UUID)) {
                    clientUuid = cookie.getValue();
                }
            }
        }

        if (clientUuid == null) {
            throw new JwtNotMeException();
        }

        return clientUuid;
    }

}
