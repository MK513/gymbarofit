package skku.gymbarofit.api.gym;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.gym.dto.GymMembershipResponseDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.membership.Membership;
import skku.gymbarofit.core.membership.enums.MembershipStatus;
import skku.gymbarofit.core.membership.exceptions.MembershipErrorCode;
import skku.gymbarofit.core.membership.exceptions.MembershipException;
import skku.gymbarofit.core.membership.service.MembershipInternalService;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

@Slf4j
@Transactional
@Service
@RequiredArgsConstructor
public class GymService {

    private final GymInternalService gymInternalService;
    private final MembershipInternalService membershipInternalService;
    private final MemberInternalService memberInternalService;

    @Transactional(readOnly = true)
    public Page<GymResponseDto> searchByKeyword(String keyword, Pageable pageable) {

        String kw = keyword == null ? "" : keyword.trim();
        if (kw.isEmpty()) return Page.empty(pageable);

        return gymInternalService.findByKeyword(kw, pageable)
                .map(GymResponseDto::from);
    }

    public GymMembershipResponseDto register(Long memberId, Long gymId) {


        Member member = memberInternalService.findById(memberId);
        Gym gym = gymInternalService.findById(gymId);

        if (membershipInternalService.existsByMemberIdAndGymId(memberId, gymId)) {
            throw new MembershipException(MembershipErrorCode.MEMBERSHIP_ALREADY_EXISTS);
        }

        // TODO: expiresAt은 어떻게 처리해야하는가 헬스장 등록 결제 프로세스 만들기? / 이메일 등록 확인 시 입력
        Membership membership = Membership.builder()
                .gym(gym)
                .member(member)
                .status(MembershipStatus.ACTIVE)
                .build();

        membershipInternalService.register(membership);

        return GymMembershipResponseDto.of(membership);
    }
}
