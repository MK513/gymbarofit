package skku.gymbarofit.core.token;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.user.enums.UserRole;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findAllByFamilyId(String familyId);

    void deleteAllByExpiresAtBefore(LocalDateTime cutoff);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true " +
           "WHERE r.userId = :userId AND r.userRole = :userRole AND r.revoked = false")
    void revokeAllByUserIdAndUserRole(@Param("userId") Long userId, @Param("userRole") UserRole userRole);

    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.familyId = :familyId AND r.revoked = false")
    void revokeAllByFamilyId(@Param("familyId") String familyId);
}
