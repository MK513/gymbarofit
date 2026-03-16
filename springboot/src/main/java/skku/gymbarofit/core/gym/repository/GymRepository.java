package skku.gymbarofit.core.gym.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.enums.GymStatus;

import java.util.List;
import java.util.Optional;

public interface GymRepository extends JpaRepository<Gym, Long> {

    @Query("""
        select g
        from Gym g
        where lower(g.name) like lower(concat('%', :keyword, '%'))
           or lower(g.address) like lower(concat('%', :keyword, '%'))
    """)
    Page<Gym> findByKeyword(String keyword, Pageable pageable);

    List<Gym> findByOwner_Id(Long ownerId);

    Optional<Gym> findByOwner_IdAndStatus(Long ownerId, GymStatus status);
}
