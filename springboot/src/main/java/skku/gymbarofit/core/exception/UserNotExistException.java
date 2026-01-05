package skku.gymbarofit.core.exception;

public class UserNotExistException extends RuntimeException {

    public UserNotExistException() {
        super("존재하지 않는 유저입니다.");
    }
}
