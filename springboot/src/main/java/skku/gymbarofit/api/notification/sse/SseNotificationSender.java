package skku.gymbarofit.api.notification.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.notification.NotificationSender;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.dto.EquipmentResponseDto;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SseNotificationSender implements NotificationSender {

    private final SseService sseService;
    private final EquipmentUsageInternalService equipmentUsageInternalService;

    @Override
    public void sendWaitingAvailable(Long userId, Long equipmentId) {
        Map<String, Object> payload = Map.of(
                "type", "WAITING_AVAILABLE",
                "equipmentId", equipmentId,
                "title", "예약 가능!",
                "body", "대기하던 기구에 자리가 났어요. 지금 예약하세요.",
                "expiresInSec", 60
        );
        sseService.send(userId, "notification", payload);
    }

    @Override
    public void broadcastEquipmentStatus(Equipment equipment) {
        List<EquipmentUsage> usages = equipmentUsageInternalService.findActiveByGymId(equipment.getGym().getId());
        EquipmentResponseDto body = EquipmentResponseDto.from(equipment, usages);

        Map<String, Object> payload = Map.of(
                "type", "UPDATE_EQUIPMENT",
                "equipmentId", equipment.getId(),
                "title", "기구 업데이트",
                "body", body,
                "expiresInSec", 60
        );
        sseService.broadcast("equipment-update", payload);
    }


}
