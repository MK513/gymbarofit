package skku.gymbarofit.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import skku.gymbarofit.domain.status.GenderStatus;

@Getter @Setter
public class UserSignupDto {

    @NotEmpty(message = "이름을 입력해주세요")
    private String name;

    @NotEmpty(message = "이메일을 입력해주세요")
    private String email;

    @NotEmpty(message = "비밀번호를 입력해주세요")
    private String password;

    private String phone_number;
    private String address;

    private GenderStatus genderStatus;
}
