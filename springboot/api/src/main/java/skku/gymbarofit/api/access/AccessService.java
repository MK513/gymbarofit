package skku.gymbarofit.api.access;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.log.dto.AccessStatusDto;
import skku.gymbarofit.core.log.service.AccessLogInternalService;
import skku.gymbarofit.core.membership.exceptions.MembershipErrorCode;
import skku.gymbarofit.core.membership.exceptions.MembershipException;
import skku.gymbarofit.core.membership.service.MembershipInternalService;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;

@Service
@Transactional
@RequiredArgsConstructor
public class AccessService {

    private final AccessLogInternalService accessLogInternalService;
    private final MembershipInternalService membershipInternalService;
    private final MemberInternalService memberInternalService;
    private final GymInternalService gymInternalService;

    public AccessStatusDto checkIn(Long memberId, Long gymId) {
        validateMembership(memberId, gymId);
        Member member = memberInternalService.findById(memberId);
        Gym gym = gymInternalService.findById(gymId);
        accessLogInternalService.checkIn(member, gym);
        return accessLogInternalService.getAccessStatus(memberId, gymId);
    }

    public AccessStatusDto checkOut(Long memberId, Long gymId) {
        Gym gym = gymInternalService.findById(gymId);
        accessLogInternalService.checkOut(memberId, gymId, gym);
        return accessLogInternalService.getAccessStatus(memberId, gymId);
    }

    private void validateMembership(Long memberId, Long gymId) {
        if (!membershipInternalService.existsByMemberIdAndGymId(memberId, gymId)) {
            throw new MembershipException(MembershipErrorCode.MEMBERSHIP_NOT_FOUND);
        }
    }
}
