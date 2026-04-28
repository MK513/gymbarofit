package skku.gymbarofit.api.equipment;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class EquipmentUsageTtlService {

    static final String KEY_PREFIX = "usage:force_end:";
    private static final long TTL_SECONDS = 1200L;

    private final RedisTemplate<String, String> redisTemplate;

    public void registerTtlAfterCommit(Long usageId) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                redisTemplate.opsForValue().set(KEY_PREFIX + usageId, String.valueOf(usageId), TTL_SECONDS, TimeUnit.SECONDS);
            }
        });
    }

    public void deleteTtl(Long usageId) {
        redisTemplate.delete(KEY_PREFIX + usageId);
    }
}
