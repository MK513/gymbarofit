package skku.gymbarofit.api.notification;

import skku.gymbarofit.core.item.equipment.Equipment;

<<<<<<< HEAD
=======
// TODO 추후 FCM으로 확장
>>>>>>> origin/main
public interface NotificationSender {
    void sendWaitingAvailable(Long userId, Long equipmentId);
    void broadcastEquipmentStatus(Long equipmentId);
}
