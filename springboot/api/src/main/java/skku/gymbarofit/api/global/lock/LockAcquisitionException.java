package skku.gymbarofit.api.global.lock;

public class LockAcquisitionException extends RuntimeException {

    private final String lockKey;

    public LockAcquisitionException(String lockKey) {
        super("분산락 획득 실패: " + lockKey);
        this.lockKey = lockKey;
    }

    public String getLockKey() {
        return lockKey;
    }
}
