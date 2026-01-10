package skku.gymbarofit.api.membership;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.membership.dto.MembershipResponseDto;
import skku.gymbarofit.api.security.UserContext;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.exceptions.GymErrorCode;
import skku.gymbarofit.core.gym.exceptions.GymException;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.membership.Membership;
import skku.gymbarofit.core.membership.enums.MembershipStatus;
import skku.gymbarofit.core.membership.exceptions.MembershipErrorCode;
import skku.gymbarofit.core.membership.exceptions.MembershipException;
import skku.gymbarofit.core.membership.service.MembershipInternalService;
import skku.gymbarofit.core.user.exception.UserException;
import skku.gymbarofit.core.user.exception.code.UserErrorCode;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

import java.util.List;

@Slf4j
@Transactional
@RequiredArgsConstructor
@Service
public class MembershipService {

    private final GymInternalService gymInternalService;
    private final MembershipInternalService membershipInternalService;
    private final MemberInternalService memberInternalService;

    @Transactional(readOnly = true)
    public MembershipResponseDto info(UserContext userContext) {

        List<Gym> gymList = gymInternalService.findGymByMemberId(userContext.getId());
        List<GymResponseDto> gymResponseDtoList = gymList.stream()
                .map(GymResponseDto::from)
                .toList();

        return new MembershipResponseDto(gymResponseDtoList);
    }

    public MembershipRegisterResponseDto register(UserContext userContext, MembershipRegisterRequestDto membershipRegisterRequestDto) {

        Long gymId = membershipRegisterRequestDto.getGymId();
        Long memberId = userContext.getId();

        Gym gym = gymInternalService.findById(gymId).orElseThrow(() -> new GymException(GymErrorCode.GYM_NOT_FOUND));
        Member member = memberInternalService.findById(memberId).orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        if (membershipInternalService.existsByMemberIdAndGymId(memberId, gymId)) {
            throw new MembershipException(MembershipErrorCode.MEMBERSHIP_ALREADY_EXISTS);
        }

        // TODO: expiresAt은 어떻게 처리해야하는가 헬스장 등록 결제 프로세스 만들기? / 이메일 등록 확인 시 입력
        Membership membership = Membership.builder()
                .gym(gym)
                .member(member)
                .status(MembershipStatus.ACTIVE)
                .build();

        log.info("Membership: memberId {}  gymId {}", membership.getMember().getId(), membership.getGym().getId());

        membershipInternalService.register(membership);

        return MembershipRegisterResponseDto.of(membership);
    }
}
