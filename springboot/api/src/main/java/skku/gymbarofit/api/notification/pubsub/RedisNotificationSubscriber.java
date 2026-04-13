package skku.gymbarofit.api.notification.pubsub;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RTopic;
import org.redisson.api.RedissonClient;
import org.redisson.codec.JsonJacksonCodec;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.notification.sse.SseService;

import java.util.concurrent.Executor;

@Slf4j
@Component
public class RedisNotificationSubscriber {

    private final RedissonClient redissonClient;
    private final SseService sseService;
    private final ObjectMapper redisObjectMapper;
    private final Executor notificationExecutor;

    private RTopic topic;
    private int listenerRegistrationId;

    public RedisNotificationSubscriber(RedissonClient redissonClient,
                                       SseService sseService,
                                       ObjectMapper redisObjectMapper,
                                       @Qualifier("notificationExecutor") Executor notificationExecutor) {
        this.redissonClient = redissonClient;
        this.sseService = sseService;
        this.redisObjectMapper = redisObjectMapper;
        this.notificationExecutor = notificationExecutor;
    }

    @PostConstruct
    public void init() {
        topic = redissonClient.getTopic(
                RedisNotificationPublisher.CHANNEL,
                new JsonJacksonCodec(redisObjectMapper));

        listenerRegistrationId = topic.addListener(NotificationMessage.class,
                (channel, message) -> notificationExecutor.execute(() -> dispatch(message)));

        log.info("[SSE-Sub] subscribed to channel={}", RedisNotificationPublisher.CHANNEL);
    }

    @PreDestroy
    public void destroy() {
        if (topic != null) {
            topic.removeListener(listenerRegistrationId);
            log.info("[SSE-Sub] unsubscribed from channel={}", RedisNotificationPublisher.CHANNEL);
        }
    }

    private void dispatch(NotificationMessage message) {
        try {
            if (message.getTargetUserId() != null) {
                sseService.send(message.getTargetUserId(), message.getEventName(), message.getPayload());
            } else {
                sseService.broadcast(message.getEventName(), message.getPayload());
            }
        } catch (Exception e) {
            log.error("[SSE-Sub] dispatch error: {}", e.getMessage(), e);
        }
    }
}
