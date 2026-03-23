package skku.gymbarofit.core.user.dto;

import lombok.Builder;
import lombok.Getter;
import skku.gymbarofit.core.gym.dto.GymDetailResponseDto;

@Getter
@Builder
public class UserRequestInfo {

    private Long id;
    private String email;
    private String name;
    private String role;
    private GymDetailResponseDto gym;
}
