package skku.gymbarofit.api.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.equipment.dto.EquipmentListResponseDto;
import skku.gymbarofit.core.item.equipment.dto.EquipmentResponseDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.service.EquipmentInternalService;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Transactional
@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentInternalService equipmentInternalService;
    private final EquipmentUsageInternalService equipmentUsageInternalService;
    private final MemberInternalService memberInternalService;
    private final GymInternalService gymInternalService;

    public EquipmentListResponseDto getEquipments(Long gymId) {

        List<Equipment> equipments = equipmentInternalService.findAllByGymId(gymId);
        List<EquipmentUsage> usages = equipmentUsageInternalService.findActiveByGymId(gymId);

        Map<Long, List<EquipmentUsage>> usageMap = usages.stream()
                .collect(Collectors.groupingBy(u -> u.getEquipment().getId()));

        List<EquipmentResponseDto> listDto = equipments.stream()
                .map(e -> EquipmentResponseDto.from(e, usageMap.getOrDefault(e.getId(), List.of())))
                .toList();

        List<String> equipmentTypes = equipments.stream().map(Equipment::getType).distinct().toList();

        int totalCount = equipments.size();

        return EquipmentListResponseDto.of(totalCount, equipmentTypes, listDto);
    }

    public void joinQueue(Long memberId, Long equipmentId) {

        Member member = memberInternalService.findById(memberId);
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        Gym gym = equipment.getGym();

        EquipmentUsage equipmentUsage = EquipmentUsage.createQueue(member, gym, equipment);

        equipmentUsageInternalService.save(equipmentUsage);
    }

    public void startUsage(Long memberId, Long equipmentId) {

        Member member = memberInternalService.findById(memberId);
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        Gym gym = equipment.getGym();

        EquipmentUsage equipmentUsage = EquipmentUsage.createUse(member, gym, equipment);

        equipmentUsageInternalService.save(equipmentUsage);
    }

    public void endUsage(Long memberId, Long equipmentId) {

        EquipmentUsage currentUsage = equipmentUsageInternalService.findInUseByEquipmentIdAndMemberId(equipmentId, memberId);
        currentUsage.completeUse();

        EquipmentUsage firstWaiting = equipmentUsageInternalService.findFirstWaitingByEquipmentId(equipmentId);
        if (firstWaiting != null) {
            firstWaiting.startUse();

            //TODO 알림 보내기
        }
    }
}

