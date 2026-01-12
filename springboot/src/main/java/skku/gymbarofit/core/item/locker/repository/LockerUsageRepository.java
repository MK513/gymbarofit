package skku.gymbarofit.core.item.locker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;

import java.util.List;
import java.util.Optional;

public interface LockerUsageRepository extends JpaRepository<LockerUsage, Long> {

    List<LockerUsage> findAllByLocker_LockerZone_IdAndStatus(
            Long zoneId,
            LockerUsageStatus status
    );

    Boolean existsByLocker_Id(Long lockerId);

    @Query("""
        select u
        from LockerUsage u
        where u.locker.lockerZone.gym.id = :gymId
          and u.member.id = :memberId
    """)
    Optional<LockerUsage> findByGymIdAndMemberId(@Param("gymId") Long gymId, @Param("memberId") Long memberId);

    @Query("""
        select count(u) > 0
        from LockerUsage u
        where u.locker.lockerZone.gym.id = :gymId
            and u.member.id = :memberId
    """)
    Boolean existsByGymIdAndMemberId(Long gymId, Long memberId);
}
