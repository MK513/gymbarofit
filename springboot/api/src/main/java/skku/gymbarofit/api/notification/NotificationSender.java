package skku.gymbarofit.api.notification;

import skku.gymbarofit.core.item.equipment.Equipment;

public interface NotificationSender {
    void sendWaitingAvailable(Long userId, Long equipmentId);
    void broadcastEquipmentStatus(Long equipmentId);
}
