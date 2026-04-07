package skku.gymbarofit.core.gym.dto;

import lombok.Builder;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.enums.GymCrowdLevel;

import java.util.List;

@Builder
public record GymResponseDto (
        int gymCount,
        List<GymDetailResponseDto> gymList,
        GymCrowdLevel crowdLevel

) {
    public static GymResponseDto from(Gym gym, List<GymDetailResponseDto> gymResponseDtoList) {
        return GymResponseDto.builder()
                .gymList(gymResponseDtoList)
                .gymCount(gymResponseDtoList.size())
                .crowdLevel(gym.getCrowdLevel())
                .build();
    }
}
