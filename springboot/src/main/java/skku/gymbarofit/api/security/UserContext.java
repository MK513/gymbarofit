package skku.gymbarofit.api.security;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import skku.gymbarofit.core.user.UserRole;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class UserContext {

    private Long id;
    private UserRole role;

}
