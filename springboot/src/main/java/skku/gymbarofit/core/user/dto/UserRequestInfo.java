package skku.gymbarofit.core.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserRequestInfo {
    private Long id;
    private String email;
    private String name;
    private String role;
}
