package skku.gymbarofit.core.usage.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.repository.EquipmentUsageRepository;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class EquipmentUsageInternalService {
    private final EquipmentUsageRepository equipmentUsageRepository;

    @Transactional(readOnly = true)
    public List<EquipmentUsage> findActiveByGymId(Long gymId) {
        return equipmentUsageRepository.findActiveByGymId(gymId);
    }

    public EquipmentUsage save(EquipmentUsage equipmentUsage) {
        return equipmentUsageRepository.save(equipmentUsage);
    }

    @Transactional(readOnly = true)
    public List<EquipmentUsage> findActiveByMemberId(Long memberId) {
        return equipmentUsageRepository.findActiveByMemberId(memberId);
    }

    @Transactional(readOnly = true)
    public Optional<EquipmentUsage> findInUseByMemberId(Long memberId) {
        return equipmentUsageRepository.findInUseByMemberId(memberId);
    }

    @Transactional(readOnly = true)
    public Optional<EquipmentUsage> findWaitingByMemberId(Long memberId) {
        return equipmentUsageRepository.findWaitingByMemberId(memberId);
    }

    @Transactional(readOnly = true)
    public int countWaiting(Long equipmentId, Long memberId) {
        return equipmentUsageRepository.countWaitingForMember(equipmentId, memberId);
    }

    @Transactional(readOnly = true)
    public EquipmentUsage findInUseByEquipmentIdAndMemberId(Long equipmentId, Long memberId) {
        return equipmentUsageRepository.findInUseForUpdate(equipmentId, memberId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_NOT_FOUND));
    }

    public EquipmentUsage findFirstWaitingByEquipmentId(Long equipmentId) {
        return equipmentUsageRepository.findWaitingForUpdate(equipmentId, PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);
    }
}
