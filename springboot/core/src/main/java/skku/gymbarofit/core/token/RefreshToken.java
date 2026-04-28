package skku.gymbarofit.core.token;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.user.enums.UserRole;

import java.time.LocalDateTime;

@Entity
@Table(name = "REFRESH_TOKENS")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class RefreshToken extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash", unique = true, nullable = false, length = 64)
    private String tokenHash;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role", nullable = false, length = 10)
    private UserRole userRole;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    @Column(name = "revoked", nullable = false)
    private boolean revoked = false;

    @Builder.Default
    @Column(name = "reuse_count", nullable = false)
    private int reuseCount = 0;

    @Column(name = "family_id", nullable = false, length = 36)
    private String familyId;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public void revoke() {
        this.revoked = true;
    }
}
