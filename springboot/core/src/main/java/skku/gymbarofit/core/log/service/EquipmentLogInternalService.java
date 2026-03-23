package skku.gymbarofit.core.log.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.log.EquipmentLog;
import skku.gymbarofit.core.log.repository.EquipmentLogRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentLogInternalService {

    private final EquipmentLogRepository equipmentLogRepository;

    public void save(EquipmentLog equipmentLog) {
        equipmentLogRepository.save(equipmentLog);
    }

}
