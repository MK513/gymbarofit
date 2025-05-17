package skku.gymbarofit.dto;

import lombok.Getter;
import jakarta.validation.constraints.NotEmpty;

@Getter
public class LoginDto {

    @NotEmpty(message = "이메일을 입력해주세요")
    private String email;

    @NotEmpty(message = "비밀번호를 입력해주세요")
    private String password;
}
