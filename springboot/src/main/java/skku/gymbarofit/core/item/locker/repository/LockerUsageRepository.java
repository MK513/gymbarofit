package skku.gymbarofit.core.item.locker.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface LockerUsageRepository extends JpaRepository<LockerUsage, Long> {

    List<LockerUsage> findAllByLocker_LockerZone_IdAndStatusIn(
            Long zoneId,
            Collection<LockerUsageStatus> statuses
    );

    Boolean existsByLocker_Id(Long lockerId);

    @Query("""
        select u
        from LockerUsage u
        where u.locker.lockerZone.gym.id = :gymId
          and u.member.id = :memberId
          and u.active = 1
    """)
    Optional<LockerUsage> findActiveByGymIdAndMemberId(@Param("gymId") Long gymId, @Param("memberId") Long memberId);

    @Query("""
        select count(u) > 0
        from LockerUsage u
        where u.locker.lockerZone.gym.id = :gymId
            and u.member.id = :memberId
    """)
    Boolean existsByGymIdAndMemberId(Long gymId, Long memberId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from LockerUsage u where u.id = :id and u.active = 1")
    Optional<LockerUsage> findActiveByIdForUpdate(@Param("id") Long id);
}
