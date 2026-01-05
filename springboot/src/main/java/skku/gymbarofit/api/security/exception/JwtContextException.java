package skku.gymbarofit.api.security.exception;

public class JwtContextException extends RuntimeException {

    public JwtContextException() { super("유효하지 않은 토큰입니다."); }
}
