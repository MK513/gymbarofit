package skku.gymbarofit.core.gym.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.gym.GymOperatingHour;

public interface GymOperatingHourRepository extends JpaRepository<GymOperatingHour, Long> {
}
