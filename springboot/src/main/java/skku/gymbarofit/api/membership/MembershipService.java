package skku.gymbarofit.api.membership;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.service.EquipmentInternalService;
import skku.gymbarofit.core.membership.dto.MembershipInfoResponseDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentUsageResponseDto;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;
import skku.gymbarofit.core.usage.locker.LockerUsage;
import skku.gymbarofit.core.usage.locker.service.LockerUsageInternalService;
import skku.gymbarofit.core.membership.service.MembershipInternalService;

import java.util.List;

@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class MembershipService {

    private final GymInternalService gymInternalService;
    private final MembershipInternalService membershipInternalService;
    private final LockerUsageInternalService lockerUsageInternalService;
    private final EquipmentUsageInternalService equipmentUsageInternalService;
    private final EquipmentInternalService equipmentInternalService;

    @Transactional(readOnly = true)
    public MembershipInfoResponseDto getInfo(Long gymId, Long memberId) {

        Gym gym = gymInternalService.findById(gymId);

        List<Gym> gymList = membershipInternalService.findGymByMemberId(memberId);
        List<GymResponseDto> gymResponseDtoList = gymList.stream()
                .map(GymResponseDto::from)
                .toList();

        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByGymIdAndMemberId(gymId, memberId).orElse(null);

        EquipmentUsageResponseDto inUseDto = getInUseUsageDto(memberId);
        EquipmentUsageResponseDto waitingDto =  getWaitingEquipmentUsage(memberId);

        return MembershipInfoResponseDto.from(gymResponseDtoList, gym, lockerUsage, inUseDto, waitingDto);
    }

    private EquipmentUsageResponseDto getWaitingEquipmentUsage(Long memberId) {
        EquipmentUsage waitingEquipmentUsage = equipmentUsageInternalService.findWaitingByMemberId(memberId).orElse(null);
        Equipment waitingEquipment = waitingEquipmentUsage != null ? waitingEquipmentUsage.getEquipment() : null;
        int waitingCount = 0;
        if (waitingEquipmentUsage != null) {
            waitingCount = equipmentUsageInternalService.countWaitingById(waitingEquipmentUsage.getId(), memberId);
        }

        return EquipmentUsageResponseDto.from(waitingEquipmentUsage, waitingEquipment, waitingCount);
    }

    private EquipmentUsageResponseDto getInUseUsageDto(Long memberId) {
        EquipmentUsage inUseUsage = equipmentUsageInternalService.findInUseByMemberId(memberId).orElse(null);
        Equipment inUseEquipment = inUseUsage != null ? inUseUsage.getEquipment() : null;
        return EquipmentUsageResponseDto.from(inUseUsage, inUseEquipment, 0);
    }
}
