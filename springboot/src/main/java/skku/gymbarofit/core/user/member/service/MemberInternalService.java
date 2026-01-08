package skku.gymbarofit.core.user.member.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.user.member.dto.MemberRegisterRequestDto;
import skku.gymbarofit.core.user.exception.code.UserErrorCode;
import skku.gymbarofit.core.user.exception.UserException;
import skku.gymbarofit.core.user.member.MemberRepository;
import skku.gymbarofit.core.user.member.Member;

@Transactional
@RequiredArgsConstructor
@Service
public class MemberInternalService {

    private final MemberRepository memberRepository;

    public Member findByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND)
        );
    }

    public Member save(MemberRegisterRequestDto requestDto, String encodedPassword) {
        if (memberRepository.existsByEmail(requestDto.getEmail())) {
            throw new UserException(UserErrorCode.USER_ALREADY_EXIST);
        }

        return memberRepository.save(Member.from(requestDto, encodedPassword));
    }
}
