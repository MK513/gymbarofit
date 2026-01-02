package skku.gymbarofit.api.user.member;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.dto.MemberDetailResponseDto;
import skku.gymbarofit.core.dto.MemberRegisterRequestDto;
import skku.gymbarofit.core.service.MemberInternalService;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberInternalService memberInternalService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public MemberDetailResponseDto register(MemberRegisterRequestDto requestDto) {
        String encodedPassword = bCryptPasswordEncoder.encode(requestDto.getPassword());
        memberInternalService.save(requestDto, encodedPassword);
    }

}
