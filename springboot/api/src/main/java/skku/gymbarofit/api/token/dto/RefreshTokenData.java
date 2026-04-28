package skku.gymbarofit.api.token.dto;

import skku.gymbarofit.core.user.enums.UserRole;

import java.time.LocalDateTime;

public record RefreshTokenData(
        Long userId,
        UserRole userRole,
        String familyId,
        int reuseCount,
        LocalDateTime expiresAt,
        boolean revoked
) {}
