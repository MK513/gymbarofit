package skku.gymbarofit.core.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.exception.UserNotExistException;
import skku.gymbarofit.core.repository.OwnerRepository;
import skku.gymbarofit.core.user.Owner;

@Service
@RequiredArgsConstructor
@Transactional
public class OwnerInternalService {

    private final OwnerRepository ownerRepository;

    public Owner findByEmail(String email) {
        return ownerRepository.findByEmail(email).orElseThrow(UserNotExistException::new);
    }
}
