package skku.gymbarofit.core.membership.dto;

import lombok.Builder;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.enums.GymCrowdLevel;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.dto.LockerRentResponseDto;

import java.util.List;

@Builder
public record MembershipInfoResponseDto (
        int gymCount,
        List<GymResponseDto> gymList,
        GymCrowdLevel crowdLevel,
        LockerRentResponseDto lockerUsage
) {

    public static MembershipInfoResponseDto from(List<GymResponseDto> gymResponseDtoList, Gym gym, LockerUsage lockerUsage) {
        return MembershipInfoResponseDto.builder()
                .gymList(gymResponseDtoList)
                .gymCount(gymResponseDtoList.size())
                .crowdLevel(gym.getCrowdLevel())
                .lockerUsage(LockerRentResponseDto.from(lockerUsage))
                .build();
    }
}
