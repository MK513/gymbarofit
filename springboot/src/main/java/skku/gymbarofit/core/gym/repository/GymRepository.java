package skku.gymbarofit.core.gym.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.gym.Gym;

public interface GymRepository extends JpaRepository<Gym, Long> {
}
