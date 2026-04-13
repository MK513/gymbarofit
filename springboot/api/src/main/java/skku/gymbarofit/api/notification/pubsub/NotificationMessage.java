package skku.gymbarofit.api.notification.pubsub;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Redis Pub/Sub 채널로 전송되는 메시지 DTO.
 *
 * - targetUserId: null이면 broadcast, non-null이면 특정 사용자에게 단건 전송
 * - eventName: SseEmitter.event().name()에 전달할 SSE 이벤트 이름
 * - payload: SSE data body로 클라이언트에 전달될 Map
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {

    private NotificationType type;
    private Long targetUserId;
    private String eventName;
    private Map<String, Object> payload;

    public enum NotificationType {
        WAITING_AVAILABLE,
        EQUIPMENT_UPDATE
    }

    public static NotificationMessage forUser(Long userId, String eventName, Map<String, Object> payload) {
        return new NotificationMessage(NotificationType.WAITING_AVAILABLE, userId, eventName, payload);
    }

    public static NotificationMessage broadcast(String eventName, Map<String, Object> payload) {
        return new NotificationMessage(NotificationType.EQUIPMENT_UPDATE, null, eventName, payload);
    }
}
