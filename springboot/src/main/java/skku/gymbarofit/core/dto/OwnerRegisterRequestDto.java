package skku.gymbarofit.core.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import skku.gymbarofit.core.user.UserRole;

@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class OwnerRegisterRequestDto {

    private String username;

    private UserRole role;

    private String email;

    private String password;

    private String phoneNumber;

    private String address;
}
