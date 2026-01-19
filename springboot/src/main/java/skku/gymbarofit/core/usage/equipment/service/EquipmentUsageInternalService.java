package skku.gymbarofit.core.usage.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.usage.equipment.repository.EquipmentUsageRepository;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class EquipmentUsageInternalService {

    private final EquipmentUsageRepository equipmentUsageRepository;

    private static final List<EquipmentUsageStatus> WAITING_OR_CALLED =
            List.of(EquipmentUsageStatus.WAITING, EquipmentUsageStatus.CALLED);

    private static final List<EquipmentUsageStatus> INUSE_OR_WAITING_OR_CALLED =
            List.of(EquipmentUsageStatus.IN_USE, EquipmentUsageStatus.WAITING, EquipmentUsageStatus.CALLED);


    @Transactional(readOnly = true)
    public List<EquipmentUsage> findActiveByGymId(Long gymId) {
        return equipmentUsageRepository.findByGymIdAndStatusIn(gymId, INUSE_OR_WAITING_OR_CALLED);
    }

    public EquipmentUsage save(EquipmentUsage equipmentUsage) {
        return equipmentUsageRepository.save(equipmentUsage);
    }

    @Transactional(readOnly = true)
    public Optional<EquipmentUsage> findInUseByMemberId(Long memberId) {
        return equipmentUsageRepository.findByMemberIdAndStatusIn(memberId, EquipmentUsageStatus.IN_USE);
    }

    @Transactional(readOnly = true)
    public Optional<EquipmentUsage> findWaitingByMemberId(Long memberId) {
        return equipmentUsageRepository.findByMemberIdAndStatusIn(memberId, EquipmentUsageStatus.WAITING);
    }

    @Transactional(readOnly = true)
    public int countWaiting(Long equipmentId, Long memberId) {
        return equipmentUsageRepository.countWaitingForMember(equipmentId, memberId);
    }

    public EquipmentUsage findInUseForUpdate(Long equipmentId, Long memberId) {
        return equipmentUsageRepository.findInUseForUpdate(equipmentId, memberId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_NOT_FOUND));
    }

    public EquipmentUsage findFirstWaitingForUpdate(Long equipmentId) {
        return equipmentUsageRepository.findFirstWaitingForUpdate(equipmentId, PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);
    }

    public Optional<EquipmentUsage> findWaitingOrCalledForUpdate(Long memberId, Long equipmentId) {
        return equipmentUsageRepository.findWaitingOrCalledForUpdate(memberId, equipmentId, WAITING_OR_CALLED);
    }
}
