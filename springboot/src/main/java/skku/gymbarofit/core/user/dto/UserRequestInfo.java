package skku.gymbarofit.core.user.dto;

import lombok.Builder;
import lombok.Getter;
import skku.gymbarofit.core.gym.dto.GymResponseDto;

import java.util.List;

@Getter
@Builder
public class UserRequestInfo {

    private Long id;
    private String email;
    private String name;
    private String role;
    private GymResponseDto gym;
}
