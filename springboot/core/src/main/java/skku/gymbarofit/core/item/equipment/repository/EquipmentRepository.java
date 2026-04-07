package skku.gymbarofit.core.item.equipment.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.item.equipment.Equipment;

import java.util.List;
import java.util.Optional;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByGym_id(Long gymId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Equipment e where e.id = :equipmentId")
    Optional<Equipment> findByIdForUpdate(@Param("equipmentId") Long equipmentId);

    int countByGym_Id(Long gymId);

    @Query("select e.itemInfo.name, count(e) from Equipment e where e.gym.id = :gymId group by e.itemInfo.name")
    List<Object[]> countGroupByName(@Param("gymId") Long gymId);

    @Query("select e.type, count(e) from Equipment e where e.gym.id = :gymId group by e.type")
    List<Object[]> countGroupByType(@Param("gymId") Long gymId);
}
