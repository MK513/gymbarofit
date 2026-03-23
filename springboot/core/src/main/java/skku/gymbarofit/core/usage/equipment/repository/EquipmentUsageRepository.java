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
    List<EquipmentUsage> findByGymIdAndStatusIn(@Param("gymId") Long gymId, @Param("statuses") List<EquipmentUsageStatus> statuses);

    @Query("""
        select count(u)
        from EquipmentUsage u
        where u.gym.id = :gymId
          and u.status = :status
    """)
    long countByGymIdAndStatus(@Param("gymId") Long gymId, @Param("status") EquipmentUsageStatus status);

    @Query("""
        select u
        from EquipmentUsage u
        where u.member.id = :memberId
        and u.status = :status
    """)
    Optional<EquipmentUsage> findByMemberIdAndStatusIn(@Param("memberId") Long memberId, @Param("status") EquipmentUsageStatus status);

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
    int countWaitingForMember(@Param("equipmentId") Long equipmentId, @Param("memberId") Long memberId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select u
        from EquipmentUsage u
        where u.id = :usageId
    """)
    Optional<EquipmentUsage> findForUpdate(@Param("usageId") Long usageId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select u
        from EquipmentUsage u
        where u.equipment.id = :equipmentId
        and u.status = 'WAITING'
        order by u.createdAt asc
    """)
    List<EquipmentUsage> findFirstWaitingForUpdate(@Param("equipmentId") Long equipmentId, Pageable pageable);

    @Query("""
        select count(u)
        from EquipmentUsage u
        where u.equipment.id = :equipmentId
        and u.status = 'WAITING'
    """)
    int countWaitingOfEquipment(@Param("equipmentId") Long equipmentId);

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
        select u
        from EquipmentUsage u
        join fetch u.member m
        where m.id = :memberId
          and u.status = skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus.COMPLETED
          and u.endAt >= :startOfDay
          and u.endAt < :endOfDay
    """)
    List<EquipmentUsage> findCompletedForToday(
            @Param("memberId") Long memberId,
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            Pageable pageable
    );

    @Query("""
        select e.itemInfo.name, count(u)
        from EquipmentUsage u
        join u.equipment e
        where e.gym.id = :gymId
          and u.status = skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus.IN_USE
        group by e.itemInfo.name
    """)
    List<Object[]> countInUseGroupByEquipmentName(@Param("gymId") Long gymId);

    @Query("""
        select e.type, count(u)
        from EquipmentUsage u
        join u.equipment e
        where e.gym.id = :gymId
          and u.status = skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus.IN_USE
        group by e.type
    """)
    List<Object[]> countInUseGroupByEquipmentType(@Param("gymId") Long gymId);

    @Query("""
        select e.itemInfo.name, coalesce(sum(u.durationMinutes), 0)
        from EquipmentUsage u
        join u.equipment e
        where e.gym.id = :gymId
          and u.status = skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus.COMPLETED
          and u.endAt >= :startOfMonth
          and u.endAt < :startOfNextMonth
        group by e.itemInfo.name
    """)
    List<Object[]> sumDurationGroupByEquipmentName(
            @Param("gymId") Long gymId,
            @Param("startOfMonth") LocalDateTime startOfMonth,
            @Param("startOfNextMonth") LocalDateTime startOfNextMonth
    );

    @Query("""
        select u
        from EquipmentUsage u
        join fetch u.equipment e
        join fetch u.member m
        where m.id = :memberId
          and u.status = skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus.COMPLETED
          and u.endAt >= :startOfMonth
          and u.endAt < :startOfNextMonth
        order by u.endAt asc
    """)
    List<EquipmentUsage> findCompletedByMemberIdAndMonth(
            @Param("memberId") Long memberId,
            @Param("startOfMonth") LocalDateTime startOfMonth,
            @Param("startOfNextMonth") LocalDateTime startOfNextMonth
    );

}
