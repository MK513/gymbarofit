package skku.gymbarofit.api.notification.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.notification.NotificationSender;
import skku.gymbarofit.api.notification.pubsub.NotificationMessage;
import skku.gymbarofit.api.notification.pubsub.RedisNotificationPublisher;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.dto.EquipmentResponseDto;
import skku.gymbarofit.core.item.equipment.service.EquipmentInternalService;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SseNotificationSender implements NotificationSender {

    private final RedisNotificationPublisher publisher;
    private final EquipmentUsageInternalService equipmentUsageInternalService;
    private final EquipmentInternalService equipmentInternalService;

    @Override
    public void sendWaitingAvailable(Long userId, Long equipmentId) {
        Map<String, Object> payload = Map.of(
                "type", "WAITING_AVAILABLE",
                "equipmentId", equipmentId,
                "title", "예약 가능!",
                "body", "대기하던 기구에 자리가 났어요. 지금 예약하세요.",
                "expiresInSec", 60
        );
        publisher.publish(NotificationMessage.forUser(userId, "notification", payload));
    }

    @Override
    public void broadcastEquipmentStatus(Long equipmentId) {
        Equipment equipment = equipmentInternalService.findById(equipmentId);
        int waitingCount = equipmentUsageInternalService.countWaitingOfEquipment(equipmentId);
        EquipmentUsageStatus status = equipmentUsageInternalService.existUsing(equipmentId) ?
                EquipmentUsageStatus.IN_USE : EquipmentUsageStatus.AVAILABLE;

        EquipmentResponseDto body = EquipmentResponseDto.from(equipment, waitingCount, status);

        Map<String, Object> payload = Map.of(
                "type", "UPDATE_EQUIPMENT",
                "equipmentId", equipment.getId(),
                "title", "기구 업데이트",
                "body", body,
                "expiresInSec", 60
        );
        publisher.publish(NotificationMessage.broadcast("equipment-update", payload));
    }

}
