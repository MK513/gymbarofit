package skku.gymbarofit.api.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import skku.gymbarofit.core.item.equipment.Equipment;

@Component
@RequiredArgsConstructor
public class NotificationFacade {

    private final NotificationSender notificationSender;

    public void notifyWaitingAvailable(Long userId, Long equipmentId) {
        notificationSender.sendWaitingAvailable(userId, equipmentId);
    }

    public void notifyEquipmentStatus(Long equipmentId) {
        notificationSender.broadcastEquipmentStatus(equipmentId);
    }
}
