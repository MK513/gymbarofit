package skku.gymbarofit.core.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.dto.MemberRegisterRequestDto;
import skku.gymbarofit.core.exception.UserAlreadyExistException;
import skku.gymbarofit.core.repository.MemberRepository;
import skku.gymbarofit.core.user.Member;

@Transactional
@RequiredArgsConstructor
@Service
public class MemberInternalService {

    private final MemberRepository memberRepository;

    public Member save(MemberRegisterRequestDto requestDto, String encodedPassword) {
        if (memberRepository.existsByEmail(requestDto.getEmail())) {
            throw new UserAlreadyExistException();
        }

        return memberRepository.save(Member.from(requestDto, encodedPassword));
    }
}
