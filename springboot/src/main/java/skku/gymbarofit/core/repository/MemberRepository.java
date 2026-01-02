package skku.gymbarofit.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.user.Member;

public interface MemberRepository extends JpaRepository<Member, Long> {
}
