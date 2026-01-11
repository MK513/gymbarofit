package skku.gymbarofit.core.item.locker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.item.locker.LockerZone;

import java.util.List;

public interface LockerZoneRepository extends JpaRepository<LockerZone, Long> {

    List<LockerZone> findAllByGym_Id(Long gymId);
}
