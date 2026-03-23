package skku.gymbarofit.api.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import skku.gymbarofit.core.user.enums.UserRole;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserContext {

    private Long id;
    private String email;
    private UserRole role;

}
