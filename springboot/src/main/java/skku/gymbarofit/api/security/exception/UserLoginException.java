package skku.gymbarofit.api.security.exception;

public class UserLoginException extends RuntimeException{

    public UserLoginException() { super("로그인 과정에 에러가 발생했습니다.");}
}
