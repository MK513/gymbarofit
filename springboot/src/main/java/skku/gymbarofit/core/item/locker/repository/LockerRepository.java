package skku.gymbarofit.core.item.locker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.item.locker.Locker;

public interface LockerRepository extends JpaRepository<Locker, Long> {
}
