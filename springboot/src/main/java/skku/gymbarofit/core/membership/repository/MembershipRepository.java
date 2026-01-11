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

    Optional<Membership> findFirstByMember_Id(Long memberId);
}
