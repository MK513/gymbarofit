package skku.gymbarofit.dto;

import lombok.Getter;
import lombok.Setter;
import skku.gymbarofit.domain.status.GenderStatus;
import jakarta.validation.constraints.NotEmpty;

@Getter @Setter
public class UserDto {

    @NotEmpty(message = "이름을 입력해주세요")
    private String name;

    @NotEmpty(message = "이메일을 입력해주세요")
    private String email;

    @NotEmpty(message = "비밀번호를 입력해주세요")
    private String pw_hash;

    private String phone_number;
    private String address;

    private GenderStatus genderStatus;
}
