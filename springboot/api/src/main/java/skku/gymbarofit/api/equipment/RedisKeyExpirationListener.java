package skku.gymbarofit.api.equipment;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.global.lock.LockAcquisitionException;

@Slf4j
@Component
@RequiredArgsConstructor
public class RedisKeyExpirationListener implements MessageListener {

    private final RedisMessageListenerContainer listenerContainer;
    private final EquipmentService equipmentService;

    @PostConstruct
    public void init() {
        listenerContainer.addMessageListener(this, new PatternTopic("__keyevent@*__:expired"));
    }

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = new String(message.getBody());
        if (!expiredKey.startsWith(EquipmentUsageTtlService.KEY_PREFIX)) {
            return;
        }
        Long usageId = Long.parseLong(expiredKey.substring(EquipmentUsageTtlService.KEY_PREFIX.length()));
        try {
            equipmentService.forceEndUsage(usageId);
        } catch (LockAcquisitionException e) {
            log.debug("forceEndUsage 락 획득 실패 — 다른 인스턴스가 처리 중. usageId={}", usageId);
        } catch (Exception e) {
            log.error("forceEndUsage 처리 중 예외 발생. usageId={}", usageId, e);
        }
    }
}
