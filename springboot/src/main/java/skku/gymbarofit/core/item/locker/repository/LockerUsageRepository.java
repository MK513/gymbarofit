package skku.gymbarofit.core.item.locker.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;

import java.util.List;

public interface LockerUsageRepository extends JpaRepository<LockerUsage, Long> {

    List<LockerUsage> findAllByLocker_LockerZone_IdAndStatus(
            Long zoneId,
            LockerUsageStatus status
    );
}
