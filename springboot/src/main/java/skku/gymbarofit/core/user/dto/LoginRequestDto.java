package skku.gymbarofit.core.user.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class LoginRequestDto {
    String email;
    String password;
}
