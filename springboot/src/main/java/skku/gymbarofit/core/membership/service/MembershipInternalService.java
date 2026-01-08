package skku.gymbarofit.core.membership.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.membership.repository.MembershipRepository;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class MembershipInternalService {

    private final MembershipRepository membershipRepository;

    public List<Gym> findGymByMemberId(Long memberId) {
        return membershipRepository.findGymByMemberId(memberId);
    }
}
