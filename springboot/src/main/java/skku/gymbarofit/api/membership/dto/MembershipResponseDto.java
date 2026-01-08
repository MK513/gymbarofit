package skku.gymbarofit.api.membership.dto;

import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.gym.dto.GymResponseDto;

import java.util.List;

@Getter
@ToString
public class MembershipResponseDto {

    private int gymCount;
    private List<GymResponseDto> gymList;

    public MembershipResponseDto(List<GymResponseDto> gymResponseDtoList) {
        this.gymCount = gymResponseDtoList.size();
        this.gymList = gymResponseDtoList;
    }
}
