package skku.gymbarofit.api.membership.dto;

import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.enums.GymCrowdLevel;

import java.util.List;

@Getter
@ToString
public class MembershipInfoResponseDto {

    private int gymCount;
    private List<GymResponseDto> gymList;
    private GymCrowdLevel crowdLevel;

    public MembershipInfoResponseDto(List<GymResponseDto> gymResponseDtoList, Gym gym) {
        this.gymCount = gymResponseDtoList.size();
        this.gymList = gymResponseDtoList;
        this.crowdLevel = gym.getCrowdLevel();
    }
}
