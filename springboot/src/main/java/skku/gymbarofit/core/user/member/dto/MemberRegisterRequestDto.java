package skku.gymbarofit.core.user.member.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import skku.gymbarofit.core.global.enums.Gender;
import skku.gymbarofit.core.global.enums.UserRole;

@Getter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class MemberRegisterRequestDto {

    private String username;

    private UserRole role;

    private String email;

    private String password;

    private String phoneNumber;

    private String address;

    private Gender gender;
}
