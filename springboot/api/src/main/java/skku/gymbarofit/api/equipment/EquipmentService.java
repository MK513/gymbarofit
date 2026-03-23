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
import skku.gymbarofit.api.user.owner.dto.EquipmentCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.EquipmentUpdateRequestDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymEquipmentDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.item.enums.ItemStatus;
import skku.gymbarofit.core.item.equipment.dto.EquipmentListResponseDto;
import skku.gymbarofit.core.item.equipment.dto.EquipmentResponseDto;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;
import skku.gymbarofit.core.item.equipment.repository.EquipmentRepository;
import skku.gymbarofit.core.item.equipment.service.EquipmentInternalService;
import skku.gymbarofit.core.log.EquipmentLog;
import skku.gymbarofit.core.log.enums.EquipmentEventType;
import skku.gymbarofit.core.log.service.EquipmentLogInternalService;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

import java.time.Clock;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Transactional
@Service
@RequiredArgsConstructor
public class EquipmentService {

    private final EquipmentInternalService equipmentInternalService;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentUsageInternalService equipmentUsageInternalService;
    private final MemberInternalService memberInternalService;
    private final GymInternalService gymInternalService;
    private final NotificationFacade notificationFacade;
    private final EquipmentLogInternalService equipmentLogInternalService;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Clock clock;

    public EquipmentListResponseDto getEquipments(Long gymId) {

        List<Equipment> equipments = equipmentInternalService.findAllByGymId(gymId);
        List<EquipmentUsage> usages = equipmentUsageInternalService.findActiveByGymId(gymId);

        Map<Long, List<EquipmentUsage>> usageMap = usages.stream()
                .collect(Collectors.groupingBy(u -> u.getEquipment().getId()));

        List<EquipmentResponseDto> listDto = equipments.stream()
                .map(e -> EquipmentResponseDto.from(e, usageMap.getOrDefault(e.getId(), List.of())))
                .toList();

        List<String> equipmentTypes = equipments.stream().map(Equipment::getType).distinct().toList();

        return EquipmentListResponseDto.of(equipments.size(), equipmentTypes, listDto);
    }

    @NotifyEquipmentChange
    public Long joinQueue(Long memberId, @EquipmentId Long equipmentId) {

        Member member = memberInternalService.findById(memberId);
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        skku.gymbarofit.core.gym.Gym gym = equipment.getGym();

        EquipmentUsage equipmentUsage = EquipmentUsage.createQueue(member, gym, equipment);

        EquipmentUsage usage = equipmentUsageInternalService.save(equipmentUsage);

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.WAIT_JOINED, clock)
        );

        return usage.getId();
    }

    @NotifyEquipmentChange
    public void leaveQueue(Long usageId) {
        EquipmentUsage usage = equipmentUsageInternalService.findForUpdate(usageId);
        usage.leaveQueue();

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.WAIT_CANCELLED, clock)
        );
    }

    @NotifyEquipmentChange
    public Long createUsage(Long memberId, @EquipmentId Long equipmentId) {

        Member member = memberInternalService.findById(memberId);
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        skku.gymbarofit.core.gym.Gym gym = equipment.getGym();

        EquipmentUsage equipmentUsage = EquipmentUsage.createUse(member, gym, equipment, clock);

        EquipmentUsage usage = equipmentUsageInternalService.save(equipmentUsage);

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.USAGE_STARTED, clock)
        );

        return usage.getId();
    }

    @NotifyEquipmentChange
    public void endUsage(@UsageId Long usageId) {

        EquipmentUsage currentUsage = equipmentUsageInternalService.findForUpdate(usageId);
        currentUsage.endUse(currentUsage.getMember().getWeight(), clock);

        Long equipmentId = currentUsage.getEquipment().getId();
        EquipmentUsage firstWaiting = equipmentUsageInternalService.findFirstWaitingForUpdate(equipmentId);

        if (firstWaiting != null) {
            firstWaiting.call();
            applicationEventPublisher.publishEvent(new WaitingAvailableEvent(firstWaiting.getMember().getId(), equipmentId));
        }

        equipmentLogInternalService.save(
                EquipmentLog.from(currentUsage, EquipmentEventType.USAGE_ENDED, clock)
        );
    }

    @NotifyEquipmentChange
    public void startUsage(@UsageId Long usageId) {
        EquipmentUsage usage = equipmentUsageInternalService.findForUpdate(usageId);
        usage.startUse(clock);

        equipmentLogInternalService.save(
                EquipmentLog.from(usage, EquipmentEventType.USAGE_STARTED, clock)
        );
    }

    @NotifyEquipmentChange
    public OwnerGymEquipmentDto updateStatus(@EquipmentId Long equipmentId, EquipmentStatusUpdateRequestDto dto) {
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        equipment.updateStatus(ItemStatus.valueOf(dto.status()));
        return OwnerGymEquipmentDto.from(equipment);
    }

    // ─── 오너용 Equipment 관리 ──────────────────────────────────────────────────

    public List<Long> addEquipments(Long ownerId, Long gymId, EquipmentCreateRequestDto dto) {
        Gym gym = gymInternalService.findById(gymId);
        List<Equipment> list = IntStream.range(0, dto.count())
                .mapToObj(i -> {
                    Equipment e = Equipment.create(gym, dto.name(), dto.type(), dto.imageUrl(), dto.gridX(), dto.gridY());
                    if (dto.spanW() != null || dto.spanH() != null) {
                        e.updatePosition(dto.gridX(), dto.gridY(), dto.spanW(), dto.spanH());
                    }
                    return e;
                })
                .toList();
        equipmentRepository.saveAll(list);
        return list.stream().map(Equipment::getId).toList();
    }

    public OwnerGymEquipmentDto updateEquipment(Long ownerId, Long equipmentId, EquipmentUpdateRequestDto dto) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_NOT_FOUND));
        equipment.update(dto.name(), dto.type(), dto.imageUrl());
        return OwnerGymEquipmentDto.from(equipment);
    }

    public void deleteEquipment(Long ownerId, Long equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_NOT_FOUND));
        equipmentRepository.delete(equipment);
    }
}
