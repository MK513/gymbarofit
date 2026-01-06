package skku.gymbarofit.api.security.provider;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.security.UserContext;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.core.user.UserRole;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    public static final String ROLE = "role";
    public static final String EMAIL = "email";
    public static final String ISSUER = "gymbarofit";

    @Value("${app.jwt.secretKey}")
    private String secretKey;

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 1일

    /**
     * JWT 토큰 생성
     */
    public String generateAccessToken(CustomUserDetails customUserDetails, HttpServletResponse response) {

        UserContext userContext = customUserDetails.getUserContext();
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(String.valueOf(userContext.getId()))     // sub = userId
                .claim(ROLE, userContext.getRole().name())      // role = "ROLE_MEMBER"
                .claim(EMAIL, userContext.getEmail())
                .issuedAt(Date.from(now))                         // iat
                .expiration(Date.from(now.plusMillis(EXPIRATION_TIME))) // exp
                .issuer(ISSUER)                             // iss (선택)
                .signWith(getKey(), Jwts.SIG.HS256)
                .compact();
    }

    public CustomUserDetails getUserDetailsFromJwt(String token) {
        Claims claims = validateToken(token);

        Long userId = Long.parseLong(claims.getSubject());
        UserRole role = UserRole.valueOf(claims.get(ROLE, String.class));
        String email = claims.get(EMAIL, String.class);

        return new CustomUserDetails(new UserContext(userId, email, role));
    }

    // secret key 객체 생성
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    /**
     * 토큰 검증
     */
    public Claims validateToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

        } catch (Exception e) {

            if (e instanceof SecurityException) {
                log.debug("[SecurityException] 잘못된 토큰");
                throw new JwtException("[SecurityException] 잘못된 토큰");
            } else if (e instanceof MalformedJwtException) {
                log.debug("[MalformedJwtException] 잘못된 토큰");
                throw new JwtException("[MalformedJwtException] 잘못된 토큰");
            } else if (e instanceof ExpiredJwtException) {
                log.debug("[ExpiredJwtException] 토큰 만료");
                throw new JwtException("[ExpiredJwtException] 토큰 만료");
            } else if (e instanceof UnsupportedJwtException) {
                log.debug("[UnsupportedJwtException] 잘못된 형식의 토큰");
                throw new JwtException("[UnsupportedJwtException] 잘못된 형식의 토큰");
            } else if (e instanceof IllegalArgumentException) {
                log.debug("[IllegalArgumentException] 잘못된 형식의 토큰");
                throw new JwtException("[IllegalArgumentException] 잘못된 형식의 토큰");
            } else {
                log.debug("[토큰 검증 오류] {}", e.getClass());
                throw new JwtException("[토큰 검증 오류] 미처리 토큰 오류");
            }
        }
    }

    public Long getAccessTokenExpiryDuration() {
        return EXPIRATION_TIME;
    }
}
