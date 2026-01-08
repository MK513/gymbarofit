package skku.gymbarofit.core.gym.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.gym.Gym;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@ToString
public class GymResponseDto {

    private Long id;
    private String name;

    public static GymResponseDto of(Gym gym) {
        return GymResponseDto.builder()
                .id(gym.getId())
                .name(gym.getName())
                .build();
    }

}
