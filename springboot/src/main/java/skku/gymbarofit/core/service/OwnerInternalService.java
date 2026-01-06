package skku.gymbarofit.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.dto.OwnerRegisterRequestDto;
import skku.gymbarofit.core.exception.code.UserErrorCode;
import skku.gymbarofit.core.exception.UserException;
import skku.gymbarofit.core.repository.OwnerRepository;
import skku.gymbarofit.core.user.Owner;

@Service
@RequiredArgsConstructor
@Transactional
public class OwnerInternalService {

    private final OwnerRepository ownerRepository;

    public Owner findByEmail(String email) {
        return ownerRepository.findByEmail(email)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    }

    public Owner save(OwnerRegisterRequestDto requestDto, String encodedPassword) {
        if (ownerRepository.existsByEmail(requestDto.getEmail())) {
            throw new UserException(UserErrorCode.USER_ALREADY_EXIST);
        }
        return ownerRepository.save(Owner.from(requestDto, encodedPassword));
    }
}
