package skku.gymbarofit.api.membership;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.membership.dto.MembershipResponseDto;
import skku.gymbarofit.api.security.UserContext;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.membership.service.MembershipInternalService;

import java.util.List;

@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class MembershipService {

    private final MembershipInternalService membershipInternalService;

    @Transactional(readOnly = true)
    public MembershipResponseDto info(UserContext userContext) {

        log.info("userContext : {}", userContext);
        log.info("userContext.getId() : {}", userContext.getId());

        List<Gym> gymList = membershipInternalService.findGymByMemberId(userContext.getId());
        List<GymResponseDto> gymResponseDtoList = gymList.stream()
                .map(GymResponseDto::of)
                .toList();

        log.info("gymList : {}", gymList);
        log.info("gymResponseDtoList : {}", gymResponseDtoList);

        return new MembershipResponseDto(gymResponseDtoList);
    }
}
