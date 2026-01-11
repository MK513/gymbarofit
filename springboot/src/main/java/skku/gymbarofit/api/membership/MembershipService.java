package skku.gymbarofit.api.membership;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.membership.dto.MembershipInfoResponseDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.exceptions.GymErrorCode;
import skku.gymbarofit.core.gym.exceptions.GymException;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.membership.service.MembershipInternalService;

import java.util.List;
import java.util.Optional;

@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class MembershipService {

    private final GymInternalService gymInternalService;
    private final MembershipInternalService membershipInternalService;

    @Transactional(readOnly = true)
    public MembershipInfoResponseDto info(Long gymId, Long memberId) {

        Gym gym = gymInternalService.findById(gymId)
                .orElseThrow(() -> new GymException(GymErrorCode.GYM_NOT_FOUND));

        List<Gym> gymList = membershipInternalService.findGymByMemberId(memberId);
        List<GymResponseDto> gymResponseDtoList = gymList.stream()
                .map(GymResponseDto::from)
                .toList();

        return new MembershipInfoResponseDto(gymResponseDtoList, gym);
    }
}
