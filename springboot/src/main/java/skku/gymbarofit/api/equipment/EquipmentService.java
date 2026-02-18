package skku.gymbarofit.api.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.equipment.notification.events.WaitingAvailableEvent;
import skku.gymbarofit.api.global.annotation.EquipmentId;
import skku.gymbarofit.api.global.annotation.UsageId;
import skku.gymbarofit.api.notification.NotificationFacade;
import skku.gymbarofit.api.global.annotation.NotifyEquipmentChange;
import skku.gymbarofit.core.item.equipment.dto.EquipmentListResponseDto;
import skku.gymbarofit.core.item.equipment.dto.EquipmentResponseDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.service.EquipmentInternalService;
import skku.gymbarofit.core.log.EquipmentLog;
import skku.gymbarofit.core.log.enums.EquipmentEventType;
import skku.gymbarofit.core.log.service.EquipmentLogInternalService;
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
    private final NotificationFacade notificationFacade;
    private final EquipmentLogInternalService equipmentLogInternalService;
    private final ApplicationEventPublisher applicationEventPublisher;

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

    @NotifyEquipmentChange
    public void joinQueue(Long memberId, @EquipmentId Long equipmentId) {

        Member member = memberInternalService.findById(memberId);
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        Gym gym = equipment.getGym();

        EquipmentUsage equipmentUsage = EquipmentUsage.createQueue(member, gym, equipment);

        EquipmentUsage usage = equipmentUsageInternalService.save(equipmentUsage);

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.WAIT_JOINED)
        );
    }

    @NotifyEquipmentChange
    public void leaveQueue(Long usageId) {
        EquipmentUsage usage = equipmentUsageInternalService.findForUpdate(usageId);
        usage.leaveQueue();

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.WAIT_CANCELLED)
        );
    }

    @NotifyEquipmentChange
    public void createUsage(Long memberId, @EquipmentId Long equipmentId) {

        Member member = memberInternalService.findById(memberId);
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        Gym gym = equipment.getGym();

        EquipmentUsage equipmentUsage = EquipmentUsage.createUse(member, gym, equipment);

        EquipmentUsage usage = equipmentUsageInternalService.save(equipmentUsage);

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.USAGE_STARTED)
        );
    }

    @NotifyEquipmentChange
    public void endUsage(@UsageId Long usageId) {

        EquipmentUsage currentUsage = equipmentUsageInternalService.findForUpdate(usageId);
        currentUsage.endUse(currentUsage.getMember().getWeight());

        Long equipmentId = currentUsage.getEquipment().getId();
        EquipmentUsage firstWaiting = equipmentUsageInternalService.findFirstWaitingForUpdate(equipmentId);

        if (firstWaiting != null) {
            firstWaiting.call();
            applicationEventPublisher.publishEvent(new WaitingAvailableEvent(firstWaiting.getMember().getId(), equipmentId));
        }

        equipmentLogInternalService.save(
                EquipmentLog.from(currentUsage, EquipmentEventType.USAGE_ENDED)
        );
    }

    @NotifyEquipmentChange
    public void startUsage(@UsageId Long usageId) {
        EquipmentUsage usage = equipmentUsageInternalService.findForUpdate(usageId);
        usage.startUse();

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.USAGE_STARTED)
        );
    }
}

