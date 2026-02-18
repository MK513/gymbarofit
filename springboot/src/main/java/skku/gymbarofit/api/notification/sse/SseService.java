package skku.gymbarofit.api.notification.sse;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseService {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // timeout: 30m

        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError(t -> emitters.remove(userId));

        send(userId, "connected", Map.of("message", "SSE connected"));

        return emitter;
    }

    public void send(Long userId, String eventName, Object data) {

        SseEmitter emitter = emitters.get(userId);

        if (emitter == null) return;

        try {
            emitter.send(
                SseEmitter.event()
                        .name(eventName)
                        .data(data)
            );
        } catch (Exception e) {
            emitters.remove(userId);
        }
    }

    public void broadcast(String eventName, Object data) {
        emitters.forEach((userId, emitter) -> send(userId, eventName, data));
    }
}
