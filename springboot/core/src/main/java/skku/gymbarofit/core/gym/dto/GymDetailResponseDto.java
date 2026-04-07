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
public class GymDetailResponseDto {

    private Long id;
    private String name;
    private String address;

    public static GymDetailResponseDto from(Gym gym) {
        if (gym == null) {
            return null;
        }
        return GymDetailResponseDto.builder()
                .id(gym.getId())
                .name(gym.getName())
                .address(gym.getAddress())
                .build();
    }
}
