package skku.gymbarofit.api.security.provider;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import skku.gymbarofit.api.security.UserContext;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Optional;

@Slf4j
public class JwtTokenProvider {

    public static final String ROLE = "role";
    public static final String CLIENT_IP = "ip";
    public static final String CLIENT_UUID = "uuid";

    @Value("${app.jwt.secretKey}")
    private String secretKey;

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 1일

    /**
     * JWT 토큰 생성
     */
    public String generateAccessToken(UserDetails userDetails) {

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

    public UserContext getUserContextFromJwt(String token, String clientIp, String clientUuid, String userAgent) {
        Claims claims = validateToken(token);

        String encryptedIp = claims.get(CLIENT_IP, String.class);
        String encryptedUuid = claims.get(CLIENT_UUID, String.class);
        // TODO: AES256Utils 제거, Refresh Token 서버 저장 정책(정석)
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

}
