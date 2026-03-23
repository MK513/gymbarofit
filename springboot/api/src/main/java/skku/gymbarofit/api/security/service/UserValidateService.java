package skku.gymbarofit.api.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import skku.gymbarofit.core.user.User;

@RequiredArgsConstructor
@Service
public class UserValidateService {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public void validateUser(User user, String password) {
        if (!bCryptPasswordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException(user.getEmail());
        }
    }
}
