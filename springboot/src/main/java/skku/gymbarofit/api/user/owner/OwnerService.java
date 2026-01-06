package skku.gymbarofit.api.user.owner;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.dto.MemberDetailResponseDto;
import skku.gymbarofit.core.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.dto.OwnerRegisterRequestDto;
import skku.gymbarofit.core.service.OwnerInternalService;
import skku.gymbarofit.core.user.Member;
import skku.gymbarofit.core.user.Owner;

@Transactional
@Service
@RequiredArgsConstructor
public class OwnerService {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final OwnerInternalService ownerInternalService;

    public OwnerDetailResponseDto register(OwnerRegisterRequestDto requestDto) {
        String encodedPassword = bCryptPasswordEncoder.encode(requestDto.getPassword());

        Owner owner = ownerInternalService.save(requestDto, encodedPassword);

        return OwnerDetailResponseDto.of(owner);
    }
}
