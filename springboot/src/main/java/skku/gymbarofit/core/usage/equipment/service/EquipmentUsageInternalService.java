package skku.gymbarofit.core.usage.equipment.service;

import lombok.RequiredArgsConstructor;
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
        return equipmentUsageRepository.findActiveByGym_id(gymId);
    }

    public EquipmentUsage save(EquipmentUsage equipmentUsage) {
        return equipmentUsageRepository.save(equipmentUsage);
    }

    @Transactional(readOnly = true)
    public List<EquipmentUsage> findActiveByMemberId(Long memberId) {
        return equipmentUsageRepository.findActiveByMember_id(memberId);
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
    public int countWaitingById(Long usageId, Long memberId) {
        return equipmentUsageRepository.countWaitingById(usageId, memberId);
    }
}
