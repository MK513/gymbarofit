package skku.gymbarofit.core.usage.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
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
    List<EquipmentUsage> findActiveByGym_id(Long gymId);

    @Query("""
        select u
        from EquipmentUsage u
        where u.member.id = :memberId
        and u.status in ('IN_USE', 'WAITING', 'CALLED')
    """)
    List<EquipmentUsage> findActiveByMember_id(Long memberId);

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
          and u.member.id = :memberId
          and u.createdAt < (
              select eu.createdAt
              from EquipmentUsage eu
              where eu.id = :usageId
          )
    """)
    int countWaitingById(Long usageId, Long memberId);

}
