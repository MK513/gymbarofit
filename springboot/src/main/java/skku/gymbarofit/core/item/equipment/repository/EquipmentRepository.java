package skku.gymbarofit.core.item.equipment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.item.equipment.Equipment;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByGym_id(Long gymId);

    int countByGym_Id(Long gymId);
}
