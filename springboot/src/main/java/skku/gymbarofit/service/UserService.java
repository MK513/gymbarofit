package skku.gymbarofit.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.SignupDto;
import skku.gymbarofit.exception.BusinessException;
import skku.gymbarofit.exception.ErrorCode;
import skku.gymbarofit.repository.UserRepository;

import java.util.Optional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    /**
     * 회원가입
     */
    @Transactional
    public Long join(SignupDto form) {
        // 1. 회원 객체 생성
        User user = User.createUser(form, passwordEncoder);

        // 2. 중복 회원 검증
        validateDuplicateUser(user.getEmail());

        // 3. 회원 저장
        userRepository.save(user);

        // 4. 회원 id 반환
        return user.getId();
    }

    /**
     * 로그인
     */
    public User login(String email, String password) {
        // 1. 이메일로 유저 검색
        User findUser = userRepository.findByEmail(email)
                .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 2. 비밀번호 검증
        findUser.passwordAuthenticate(password, passwordEncoder);

        return findUser;
    }

    /**
     * 유저 검색
     */
    public User findOne(Long userId) {
        return userRepository.findOne(userId);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }



    private void validateDuplicateUser(String email) {
        userRepository.findByEmail(email)
                .ifPresent(member -> {
                    throw new BusinessException(ErrorCode.DUPLICATED_EMAIL_USED);
                });
    }

}
