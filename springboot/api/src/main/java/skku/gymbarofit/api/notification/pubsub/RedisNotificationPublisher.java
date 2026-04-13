package skku.gymbarofit.api.notification.pubsub;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RTopic;
import org.redisson.api.RedissonClient;
import org.redisson.codec.JsonJacksonCodec;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisNotificationPublisher {

    static final String CHANNEL = "sse:notification";

    private final RedissonClient redissonClient;
    private final ObjectMapper redisObjectMapper;

    private RTopic topic;

    @PostConstruct
    private void init() {
        topic = redissonClient.getTopic(CHANNEL, new JsonJacksonCodec(redisObjectMapper));
    }

    public void publish(NotificationMessage message) {
        try {
            topic.publish(message);
            log.debug("[SSE-Pub] type={} targetUserId={}", message.getType(), message.getTargetUserId());
        } catch (Exception e) {
            log.error("[SSE-Pub] publish failed: {}", e.getMessage(), e);
        }
    }
}
