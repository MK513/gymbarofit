package skku.gymbarofit.api.membership;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.membership.dto.MembershipInfoResponseDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.item.locker.LockerUsage;
import skku.gymbarofit.core.item.locker.service.LockerUsageInternalService;
import skku.gymbarofit.core.membership.service.MembershipInternalService;

import java.util.List;

@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class MembershipService {

    private final GymInternalService gymInternalService;
    private final MembershipInternalService membershipInternalService;
    private final LockerUsageInternalService lockerUsageInternalService;

    @Transactional(readOnly = true)
    public MembershipInfoResponseDto info(Long gymId, Long memberId) {

        Gym gym = gymInternalService.findById(gymId);

        List<Gym> gymList = membershipInternalService.findGymByMemberId(memberId);
        List<GymResponseDto> gymResponseDtoList = gymList.stream()
                .map(GymResponseDto::from)
                .toList();

        LockerUsage lockerUsage = lockerUsageInternalService.findByGymIdAndMemberId(gymId, memberId).orElse(null);

        return MembershipInfoResponseDto.from(gymResponseDtoList, gym, lockerUsage);
    }
}
