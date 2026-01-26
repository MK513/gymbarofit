package skku.gymbarofit.api.notification;

import skku.gymbarofit.core.item.equipment.Equipment;

// TODO 추후 FCM으로 확장
public interface NotificationSender {
    void sendWaitingAvailable(Long userId, Long equipmentId);
    void broadcastEquipmentStatus(Equipment equipment);
}
