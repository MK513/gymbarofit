package skku.gymbarofit.core.item.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;
import skku.gymbarofit.core.item.equipment.repository.EquipmentRepository;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class EquipmentInternalService {

    private final EquipmentRepository equipmentRepository;

    public List<Equipment> findAllByGymId(Long gymId) {
        return equipmentRepository.findByGym_id(gymId);
    }

    public Equipment findById(Long equipmentId) {
        return equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_NOT_FOUND));
    }
}
