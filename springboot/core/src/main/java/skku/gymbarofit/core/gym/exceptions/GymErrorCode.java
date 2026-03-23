package skku.gymbarofit.core.gym.exceptions;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import skku.gymbarofit.core.global.exception.ErrorCode;

@Getter
@RequiredArgsConstructor
public enum GymErrorCode implements ErrorCode{

    GYM_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 헬스장입니다.");

    private final HttpStatus status;
    private final String message;
}
