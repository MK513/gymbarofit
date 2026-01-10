package skku.gymbarofit.core.membership.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.membership.Membership;

import java.util.List;

public interface MembershipRepository extends JpaRepository<Membership, Long> {

    List<Membership> findAllByMemberId(Long memberId);

    boolean existsByMemberIdAndGymId(Long memberId, Long gymId);

}
