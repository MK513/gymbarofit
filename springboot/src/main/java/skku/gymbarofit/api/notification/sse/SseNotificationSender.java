package skku.gymbarofit.api.notification.sse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.notification.NotificationSender;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SseNotificationSender implements NotificationSender {

    private final SseService sseService;

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


}
