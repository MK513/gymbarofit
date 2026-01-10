package skku.gymbarofit.core.gym.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.gym.Gym;

@Getter
@Builder
@AllArgsConstructor
@ToString
public class GymResponseDto {

    private Long id;
    private String name;
    private String address;

    public static GymResponseDto from(Gym gym) {
        return GymResponseDto.builder()
                .id(gym.getId())
                .name(gym.getName())
                .address(gym.getAddress())
                .build();
    }
}
