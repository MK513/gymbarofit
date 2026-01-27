package skku.gymbarofit.core.usage.equipment.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EquipmentUsageRepository extends JpaRepository<EquipmentUsage, Long> {

    @Query("""
        select u
        from EquipmentUsage u
        where u.gym.id = :gymId
        and u.status in :statuses
    """)
    List<EquipmentUsage> findByGymIdAndStatusIn(Long gymId, List<EquipmentUsageStatus> statuses);

    @Query("""
        select u
        from EquipmentUsage u
        where u.member.id = :memberId
        and u.status = :status
    """)
    Optional<EquipmentUsage> findByMemberIdAndStatusIn(Long memberId, EquipmentUsageStatus status);

    @Query("""
        select count(u)
        from EquipmentUsage u
        where u.status = 'WAITING'
          and u.equipment.id = :equipmentId
          and u.createdAt < (
              select myEu.createdAt
              from EquipmentUsage myEu
              where myEu.equipment.id = :equipmentId
                and myEu.member.id = :memberId
                and myEu.status = 'WAITING'
          )
    """)
    int countWaitingForMember(Long equipmentId, Long memberId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select u
        from EquipmentUsage u
        where u.id = :usageId
    """)
    Optional<EquipmentUsage> findForUpdate(Long usageId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select u
        from EquipmentUsage u
        where u.equipment.id = :equipmentId
        and u.status = 'WAITING'
        order by u.createdAt asc
    """)
    List<EquipmentUsage> findFirstWaitingForUpdate(Long equipmentId, Pageable pageable);

    @Query("""
        select count(u)
        from EquipmentUsage u
        where u.equipment.id = :equipmentId
        and u.status = 'WAITING'
    """)
    int countWaitingOfEquipment(Long equipmentId);

    boolean existsByEquipmentIdAndStatus(Long equipmentId, EquipmentUsageStatus status);

    @Query("""
        select coalesce(sum(u.durationMinutes), 0)
        from EquipmentUsage u
        where u.member.id = :memberId
          and u.startAt >= :startOfDay
          and u.startAt < :endOfDay
    """)
    int sumUsageMinutesForToday(
            @Param("memberId") Long memberId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    @Query("""
        select coalesce(
            sum(
                (u.durationMinutes / 60.0)
                * e.met
                * m.weight
            ), 0
        )
        from EquipmentUsage u
        join u.equipment e
        join u.member m
        where m.id = :memberId
          and u.status = skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus.COMPLETED
          and u.endAt >= :startOfDay
          and u.endAt < :endOfDay
    """)
    float sumCaloriesForToday(
            @Param("memberId") Long memberId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay
    );

    List<EquipmentUsage> findTop3ByMemberIdAndStatusOrderByEndAtDesc(
            Long memberId,
            EquipmentUsageStatus status
    );

}
