package skku.gymbarofit.service;

import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.exception.BusinessException;
import skku.gymbarofit.exception.ErrorCode;
import skku.gymbarofit.repository.UserRepository;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * 회원가입
     */
    @Transactional
    public Long join(User user) {
        // 1. 중복 회원 검증
        validateDuplicateUser(user);

        // 2. 회원 저장
        userRepository.save(user);

        // 3. 회원 id 반환
        return user.getId();
    }

    /**
     * 유저 검색
     */
    public User findOne(Long userId) {
        return userRepository.findOne(userId);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    /**
     * 로그인
     */
    public User login(String email, String password, PasswordEncoder encoder) {
        // 1. 이메일로 유저 검색
        User findUser = userRepository.findByEmail(email);

        // 2. 비밀번호 검증
        findUser.passwordAuthenticate(password, encoder);

        return findUser;
    }

    private void validateDuplicateUser(User user) {
        User findUser = userRepository.findByEmail(user.getEmail());

        if (findUser != null) {
            throw new BusinessException(ErrorCode.USER_ALREADY_EXISTS);
        }
    }

}
