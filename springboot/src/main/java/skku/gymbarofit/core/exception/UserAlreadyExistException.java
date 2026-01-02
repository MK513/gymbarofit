package skku.gymbarofit.core.exception;

public class UserAlreadyExistException extends RuntimeException {

    public UserAlreadyExistException() {
        super("이미 가입되어 있는 이메일입니다.");
    }
}
