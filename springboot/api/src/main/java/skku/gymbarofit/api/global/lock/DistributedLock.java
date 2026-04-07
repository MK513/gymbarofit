package skku.gymbarofit.api.global.lock;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.concurrent.TimeUnit;

/**
 * 분산락 어노테이션.
 * key는 SpEL 표현식을 지원하며 메서드 파라미터를 참조할 수 있습니다.
 * 예) @DistributedLock(key = "'gym:' + #gymId")
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface DistributedLock {

    /** Redis 락 키 (SpEL). "lock:" 접두사는 Aspect에서 자동 추가됩니다. */
    String key();

    /** 락 획득 대기 시간 */
    long waitTime() default 5;

    /** 락 유지 시간 (leaseTime = -1이면 Redisson watchdog 동작) */
    long leaseTime() default 10;

    TimeUnit timeUnit() default TimeUnit.SECONDS;
}
