package skku.gymbarofit.core.gym.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.gym.Gym;

import java.util.List;

public interface GymRepository extends JpaRepository<Gym, Long> {

    @Query("""
        select g
        from Gym g
        where lower(g.name) like lower(concat('%', :keyword, '%'))
           or lower(g.address) like lower(concat('%', :keyword, '%'))
    """)
    Page<Gym> findByKeyword(String keyword, Pageable pageable);
}
