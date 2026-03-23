package skku.gymbarofit.api.token;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.security.UserContext;
import skku.gymbarofit.api.security.exception.RefreshTokenException;
import skku.gymbarofit.api.security.exception.code.SecurityErrorCode;
import skku.gymbarofit.core.token.RefreshToken;
import skku.gymbarofit.core.token.RefreshTokenRepository;
import skku.gymbarofit.core.user.enums.UserRole;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-token.expireTime}")
    private long refreshTokenExpireMillis;

    /**
     * 신규 Refresh Token 발급 및 저장
     * @return 클라이언트에 전달할 raw token
     */
    @Transactional
    public String issueRefreshToken(Long userId, UserRole userRole) {
        String rawToken = generateRawToken();
        String tokenHash = hash(rawToken);

        RefreshToken refreshToken = RefreshToken.builder()
                .tokenHash(tokenHash)
                .userId(userId)
                .userRole(userRole)
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpireMillis * 1_000_000L))
                .revoked(false)
                .reuseCount(0)
                .familyId(UUID.randomUUID().toString())
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    /**
     * Refresh Token 검증 및 rotation
     * 재사용 감지 시 family 전체 revoke 후 예외
     * @return 새로 발급된 raw token과 사용자 정보
     */
    @Transactional
    public RotationResult validateAndRotate(String rawToken) {
        String tokenHash = hash(rawToken);

        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new RefreshTokenException(SecurityErrorCode.INVALID_REFRESH_TOKEN));

        if (token.isRevoked()) {
            log.warn("[Refresh Token 재사용 감지] userId={}, role={}, familyId={}",
                    token.getUserId(), token.getUserRole(), token.getFamilyId());
            refreshTokenRepository.revokeAllByFamilyId(token.getFamilyId());
            throw new RefreshTokenException(SecurityErrorCode.REFRESH_TOKEN_REUSED);
        }

        if (token.isExpired()) {
            token.revoke();
            throw new RefreshTokenException(SecurityErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        // 기존 토큰 revoke
        token.revoke();

        // 신규 토큰 발급 (같은 familyId 유지)
        String newRawToken = generateRawToken();
        String newTokenHash = hash(newRawToken);

        RefreshToken newToken = RefreshToken.builder()
                .tokenHash(newTokenHash)
                .userId(token.getUserId())
                .userRole(token.getUserRole())
                .expiresAt(LocalDateTime.now().plusNanos(refreshTokenExpireMillis * 1_000_000L))
                .revoked(false)
                .reuseCount(token.getReuseCount() + 1)
                .familyId(token.getFamilyId())
                .build();

        refreshTokenRepository.save(newToken);

        UserContext userContext = new UserContext(token.getUserId(), null, token.getUserRole());
        return new RotationResult(userContext, newRawToken);
    }

    /**
     * 단일 Refresh Token 무효화 (logout)
     */
    @Transactional
    public void revokeByRawToken(String rawToken) {
        String tokenHash = hash(rawToken);
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(RefreshToken::revoke);
    }

    /**
     * 특정 사용자의 모든 Refresh Token 무효화 (전체 기기 logout)
     */
    @Transactional
    public void revokeAllForUser(Long userId, UserRole userRole) {
        refreshTokenRepository.revokeAllByUserIdAndUserRole(userId, userRole);
    }

    /**
     * 매일 새벽 3시 만료된 토큰 정리
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void purgeExpiredTokens() {
        refreshTokenRepository.deleteAllByExpiresAtBefore(LocalDateTime.now());
        log.info("[RefreshToken] 만료된 토큰 정리 완료");
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

    public record RotationResult(UserContext userContext, String newRawToken) {}
}
