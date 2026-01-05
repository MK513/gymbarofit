package skku.gymbarofit.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.user.Member;
import skku.gymbarofit.core.user.Owner;
import skku.gymbarofit.core.user.User;

import java.util.Optional;

public interface OwnerRepository extends JpaRepository<Owner, Long> {

    Optional<Owner> findByEmail(String email);
    
    Boolean existsByEmail(String email);
}
