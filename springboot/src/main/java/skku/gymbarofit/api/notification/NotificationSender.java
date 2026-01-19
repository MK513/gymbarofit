package skku.gymbarofit.api.notification;

// TODO 추후 FCM으로 확장
public interface NotificationSender {
    void sendWaitingAvailable(Long userId, Long equipmentId);
}
