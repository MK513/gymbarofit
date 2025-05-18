package skku.gymbarofit.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secretKey}")
    private String secretKey;

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 1일

    /**
     * JWT 토큰 생성
     */
    public String createToken(UserDetails userDetails) {

        Date now = new Date();
        Date accessExpiration = new Date(now.getTime() + EXPIRATION_TIME);

        Optional<String> role = userDetails.getAuthorities()
                .stream().map(GrantedAuthority::getAuthority)
                .findAny();

        return Jwts.builder()
                .header()
                    .add("typ", "JWT")
                    .add("alg", "HS256")
                    .add("regDate", System.currentTimeMillis())
                .and()
                .claims()
                    .add("role", role.orElse("MEMBER"))
                .and()
                .subject(userDetails.getUsername())
                .signWith(getKey(), Jwts.SIG.HS256) // JWT 서명 발급
                .expiration(accessExpiration)
                .compact();
    }

    // secret key 객체 생성
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    /**
     * 토큰 검증
     */
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
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

    public Claims getClaims(String jwt) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(jwt)
                .getPayload();
    }
}
