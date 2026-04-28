package skku.gymbarofit.api.membership;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.service.EquipmentInternalService;
import skku.gymbarofit.core.log.dto.AccessStatusDto;
import skku.gymbarofit.core.log.service.AccessLogInternalService;
import skku.gymbarofit.core.log.service.EquipmentLogInternalService;
import skku.gymbarofit.core.membership.dto.MembershipInfoResponseDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymDetailResponseDto;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentHistoryResponseDto;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentRecordResponseDto;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentUsageDetailResponseDto;
import skku.gymbarofit.core.usage.equipment.dto.EquipmentUsageResponseDto;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;
import skku.gymbarofit.core.usage.locker.LockerUsage;
import skku.gymbarofit.core.usage.locker.service.LockerUsageInternalService;
<<<<<<< HEAD
import skku.gymbarofit.api.membership.dto.GymMemberResponseDto;
=======
>>>>>>> origin/main
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
    private final EquipmentLogInternalService equipmentLogInternalService;
    private final AccessLogInternalService accessLogInternalService;

    @Transactional(readOnly = true)
    public MembershipInfoResponseDto getInfo(Long gymId, Long memberId) {

        GymResponseDto gymResponseDto = getGymResponseDto(gymId, memberId);

        LockerUsage lockerUsage = lockerUsageInternalService.findActiveByGymIdAndMemberId(gymId, memberId).orElse(null);

        EquipmentUsageResponseDto equipmentUsageResponseDto = getEquipmentUsageResponseDto(memberId);

        EquipmentHistoryResponseDto historyDto = getHistoryDto(memberId);

        AccessStatusDto checkInStatus = accessLogInternalService.getAccessStatus(memberId, gymId);

        return MembershipInfoResponseDto.from(gymResponseDto, lockerUsage, equipmentUsageResponseDto, historyDto, checkInStatus);
    }

    private EquipmentUsageResponseDto getEquipmentUsageResponseDto(Long memberId) {
        EquipmentUsageDetailResponseDto inUseDto = getInUseUsageDto(memberId);
        EquipmentUsageDetailResponseDto waitingDto = getWaitingUsageDto(memberId);
        return EquipmentUsageResponseDto.of(inUseDto, waitingDto);
    }

    private GymResponseDto getGymResponseDto(Long gymId, Long memberId) {
        Gym gym = gymInternalService.findById(gymId);
        List<Gym> gymList = membershipInternalService.findGymByMemberId(memberId);
        List<GymDetailResponseDto> gymResponseDtoList = gymList.stream()
                .map(GymDetailResponseDto::from)
                .toList();
        return GymResponseDto.from(gym, gymResponseDtoList);
    }

    private EquipmentHistoryResponseDto getHistoryDto(Long memberId) {
        int todayTotalUsageMinutes = equipmentUsageInternalService.getTodayTotalUsageMinutes(memberId);
        float todayTotalCalories = equipmentUsageInternalService.getTodayTotalCalories(memberId);
        todayTotalCalories = Math.round(todayTotalCalories * 10.0f) / 10.0f;

        List<EquipmentRecordResponseDto> recentThreeUsages = equipmentUsageInternalService.getRecentThreeActivitiesToday(memberId)
                .stream().map(EquipmentRecordResponseDto::from)
                .toList();

        return EquipmentHistoryResponseDto.of(todayTotalUsageMinutes, todayTotalCalories, recentThreeUsages);
    }

    private EquipmentUsageDetailResponseDto getWaitingUsageDto(Long memberId) {
        EquipmentUsage waitingEquipmentUsage = equipmentUsageInternalService.findWaitingByMemberId(memberId).orElse(null);
        Equipment waitingEquipment = waitingEquipmentUsage != null ? waitingEquipmentUsage.getEquipment() : null;
        int waitingCount = 0;
        if (waitingEquipmentUsage != null) {
            waitingCount = equipmentUsageInternalService.countWaitingForMember(waitingEquipment.getId(), memberId);
        }

        return EquipmentUsageDetailResponseDto.from(waitingEquipmentUsage, waitingEquipment, waitingCount);
    }

    private EquipmentUsageDetailResponseDto getInUseUsageDto(Long memberId) {
        EquipmentUsage inUseUsage = equipmentUsageInternalService.findInUseByMemberId(memberId).orElse(null);
        Equipment inUseEquipment = inUseUsage != null ? inUseUsage.getEquipment() : null;
        return EquipmentUsageDetailResponseDto.from(inUseUsage, inUseEquipment, 0);
    }
<<<<<<< HEAD

    @Transactional(readOnly = true)
    public List<GymMemberResponseDto> getGymMembers(Long gymId) {
        return membershipInternalService.findAllByGymId(gymId).stream()
                .map(GymMemberResponseDto::of)
                .toList();
    }

    public void deleteGymMember(Long gymId, Long memberId) {
        membershipInternalService.expireByMemberIdAndGymId(memberId, gymId);
    }
=======
>>>>>>> origin/main
}
