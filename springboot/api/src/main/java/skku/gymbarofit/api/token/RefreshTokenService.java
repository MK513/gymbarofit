package skku.gymbarofit.api.token;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import skku.gymbarofit.api.security.UserContext;
import skku.gymbarofit.api.security.exception.RefreshTokenException;
import skku.gymbarofit.api.security.exception.code.SecurityErrorCode;
import skku.gymbarofit.api.token.dto.RefreshTokenData;
import skku.gymbarofit.core.user.enums.UserRole;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final String TOKEN_PREFIX  = "refresh:token:";
    private static final String FAMILY_PREFIX = "refresh:family:";

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.jwt.refresh-token.expireTime}")
    private long refreshTokenExpireMillis;

    /**
     * 신규 Refresh Token 발급 및 Redis 저장
     * @return 클라이언트에 전달할 raw token
     */
    public String issueRefreshToken(Long userId, UserRole userRole) {
        String rawToken  = generateRawToken();
        String tokenHash = hash(rawToken);
        String familyId  = UUID.randomUUID().toString();
        long   ttlSec    = refreshTokenExpireMillis / 1000;

        RefreshTokenData data = new RefreshTokenData(
                userId, userRole, familyId, 0,
                LocalDateTime.now().plusNanos(refreshTokenExpireMillis * 1_000_000L),
                false
        );

        redisTemplate.opsForValue().set(TOKEN_PREFIX + tokenHash, toJson(data), ttlSec, TimeUnit.SECONDS);
        redisTemplate.opsForSet().add(FAMILY_PREFIX + familyId, tokenHash);
        redisTemplate.expire(FAMILY_PREFIX + familyId, ttlSec, TimeUnit.SECONDS);

        return rawToken;
    }

    /**
     * Refresh Token 검증 및 rotation
     * 재사용 감지 시 family 전체 revoke 후 예외
     * @return 새로 발급된 raw token과 사용자 정보
     */
    public RotationResult validateAndRotate(String rawToken) {
        String tokenHash = hash(rawToken);
        String key       = TOKEN_PREFIX + tokenHash;

        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            throw new RefreshTokenException(SecurityErrorCode.INVALID_REFRESH_TOKEN);
        }

        RefreshTokenData data = fromJson(json);

        if (data.revoked()) {
            log.warn("[Refresh Token 재사용 감지] userId={}, role={}, familyId={}",
                    data.userId(), data.userRole(), data.familyId());
            revokeFamilyTokens(data.familyId());
            throw new RefreshTokenException(SecurityErrorCode.REFRESH_TOKEN_REUSED);
        }

        if (LocalDateTime.now().isAfter(data.expiresAt())) {
            markRevoked(key, data);
            throw new RefreshTokenException(SecurityErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        // 기존 토큰 revoke (키 유지 → 재사용 탐지용)
        markRevoked(key, data);

        // 신규 토큰 발급 (동일 familyId 유지)
        String newRawToken = generateRawToken();
        String newHash     = hash(newRawToken);
        long   ttlSec      = refreshTokenExpireMillis / 1000;

        RefreshTokenData newData = new RefreshTokenData(
                data.userId(), data.userRole(), data.familyId(), data.reuseCount() + 1,
                LocalDateTime.now().plusNanos(refreshTokenExpireMillis * 1_000_000L),
                false
        );

        redisTemplate.opsForValue().set(TOKEN_PREFIX + newHash, toJson(newData), ttlSec, TimeUnit.SECONDS);
        redisTemplate.opsForSet().add(FAMILY_PREFIX + data.familyId(), newHash);

        UserContext userContext = new UserContext(data.userId(), null, data.userRole());
        return new RotationResult(userContext, newRawToken);
    }

    /**
     * 단일 Refresh Token 무효화 (logout)
     */
    public void revokeByRawToken(String rawToken) {
        redisTemplate.delete(TOKEN_PREFIX + hash(rawToken));
    }

    /**
     * 특정 사용자의 모든 Refresh Token 무효화
     * Redis에는 userId 인덱스가 없으므로 현재 미지원 (호출처 없음)
     */
    public void revokeAllForUser(Long userId, UserRole userRole) {
        log.warn("[RefreshTokenService] revokeAllForUser 는 Redis 모드에서 지원되지 않습니다. userId={}", userId);
    }

    // ─── 내부 헬퍼 ──────────────────────────────────────────────────────────────

    private void revokeFamilyTokens(String familyId) {
        String familyKey = FAMILY_PREFIX + familyId;
        Set<String> hashes = redisTemplate.opsForSet().members(familyKey);
        if (hashes != null) {
            hashes.forEach(h -> redisTemplate.delete(TOKEN_PREFIX + h));
        }
        redisTemplate.delete(familyKey);
    }

    private void markRevoked(String key, RefreshTokenData data) {
        Long remainingTtl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
        long ttl = (remainingTtl != null && remainingTtl > 0) ? remainingTtl : refreshTokenExpireMillis / 1000;

        RefreshTokenData revoked = new RefreshTokenData(
                data.userId(), data.userRole(), data.familyId(),
                data.reuseCount(), data.expiresAt(), true
        );
        redisTemplate.opsForValue().set(key, toJson(revoked), ttl, TimeUnit.SECONDS);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (Exception e) {
            throw new RuntimeException("토큰 해시 생성 실패", e);
        }
    }

    private String toJson(RefreshTokenData data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("RefreshTokenData 직렬화 실패", e);
        }
    }

    private RefreshTokenData fromJson(String json) {
        try {
            return objectMapper.readValue(json, RefreshTokenData.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("RefreshTokenData 역직렬화 실패", e);
        }
    }

    public record RotationResult(UserContext userContext, String newRawToken) {}
}
