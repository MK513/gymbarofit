package skku.gymbarofit.core.usage.equipment.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;

import java.util.List;
import java.util.Optional;

public interface EquipmentUsageRepository extends JpaRepository<EquipmentUsage, Long> {

    @Query("""
        select u
        from EquipmentUsage u
        where u.gym.id = :gymId
        and u.status in ('IN_USE', 'WAITING', 'CALLED')
    """)
    List<EquipmentUsage> findActiveByGymId(Long gymId);

    @Query("""
        select u
        from EquipmentUsage u
        where u.member.id = :memberId
        and u.status in ('IN_USE', 'WAITING', 'CALLED')
    """)
    List<EquipmentUsage> findActiveByMemberId(Long memberId);

    @Query("""
        select u
        from EquipmentUsage u
        where u.member.id = :memberId
        and u.status = 'IN_USE'
    """)
    Optional<EquipmentUsage> findInUseByMemberId(Long memberId);

    @Query("""
        select u
        from EquipmentUsage u
        where u.member.id = :memberId
        and u.status = 'WAITING'
    """)
    Optional<EquipmentUsage> findWaitingByMemberId(Long memberId);

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
        where u.equipment.id = :equipmentId
        and u.member.id = :memberId
        and u.status = 'IN_USE'
    """)
    Optional<EquipmentUsage> findInUseForUpdate(Long equipmentId, Long memberId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select u
        from EquipmentUsage u
        where u.equipment.id = :equipmentId
        and u.status = 'WAITING'
        order by u.createdAt asc
    """)
    List<EquipmentUsage> findWaitingForUpdate(Long equipmentId, Pageable pageable);
}
