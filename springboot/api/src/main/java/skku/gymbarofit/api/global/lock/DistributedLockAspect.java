package skku.gymbarofit.api.global.lock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

/**
 * @DistributedLock AOP 처리.
 * @Order(HIGHEST_PRECEDENCE) — @Transactional 보다 먼저 실행(외부 래핑)되어
 * 락 획득 후 트랜잭션이 시작되고, 트랜잭션 커밋 후 락이 해제됩니다.
 */
@Slf4j
@Aspect
@Order(Ordered.HIGHEST_PRECEDENCE)
@Component
@RequiredArgsConstructor
public class DistributedLockAspect {

    private final RedissonClient redissonClient;
    private final ExpressionParser parser = new SpelExpressionParser();

    @Around("@annotation(skku.gymbarofit.api.global.lock.DistributedLock)")
    public Object around(ProceedingJoinPoint pjp) throws Throwable {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        DistributedLock distributedLock = signature.getMethod().getAnnotation(DistributedLock.class);
        String lockKey = "lock:" + resolveKey(distributedLock.key(), pjp);
        RLock lock = redissonClient.getLock(lockKey);

        boolean acquired = lock.tryLock(
                distributedLock.waitTime(),
                distributedLock.leaseTime(),
                distributedLock.timeUnit()
        );

        if (!acquired) {
            log.warn("분산락 획득 실패 - key: {}", lockKey);
            throw new LockAcquisitionException(lockKey);
        }

        log.debug("분산락 획득 - key: {}", lockKey);
        try {
            return pjp.proceed();
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.debug("분산락 해제 - key: {}", lockKey);
            }
        }
    }

    private String resolveKey(String keyExpression, ProceedingJoinPoint pjp) {
        MethodSignature signature = (MethodSignature) pjp.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = pjp.getArgs();

        StandardEvaluationContext context = new StandardEvaluationContext();
        if (paramNames != null) {
            for (int i = 0; i < paramNames.length; i++) {
                context.setVariable(paramNames[i], args[i]);
            }
        }

        return parser.parseExpression(keyExpression).getValue(context, String.class);
    }
}
