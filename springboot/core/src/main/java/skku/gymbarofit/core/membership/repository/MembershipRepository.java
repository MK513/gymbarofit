package skku.gymbarofit.core.membership.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.membership.Membership;

import java.util.List;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {

    List<Membership> findAllByMemberId(Long memberId);

    @Query("""
        select distinct m.gym
        from Membership m
        where m.member.id = :memberId
    """)
    List<Gym> findGymByMemberId(@Param("memberId") Long memberId);

    boolean existsByMemberIdAndGymId(Long memberId, Long gymId);

    void deleteByMember_IdAndGym_Id(Long memberId, Long gymId);

    Optional<Membership> findFirstByMember_Id(Long memberId);

    @Query("SELECT m FROM Membership m JOIN FETCH m.member WHERE m.gym.id = :gymId")
    List<Membership> findAllByGymId(@Param("gymId") Long gymId);

    /**
     * 해당 헬스장의 특정 연월 신규 가입 수
     */
    @Query("SELECT COUNT(m) FROM Membership m WHERE m.gym.id = :gymId AND YEAR(m.createdAt) = :year AND MONTH(m.createdAt) = :month")
    int countNewByGymAndMonth(@Param("gymId") Long gymId, @Param("year") int year, @Param("month") int month);

    /**
     * 해당 헬스장의 특정 연월 만료 예정 회원 수 (ACTIVE 상태, 해당 월 내 만료)
     */
    @Query("SELECT COUNT(m) FROM Membership m WHERE m.gym.id = :gymId AND m.status = 'ACTIVE' AND YEAR(m.expiredAt) = :year AND MONTH(m.expiredAt) = :month")
    int countExpiringByGymAndMonth(@Param("gymId") Long gymId, @Param("year") int year, @Param("month") int month);
}
