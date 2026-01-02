package skku.gymbarofit.core.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.User;
import skku.gymbarofit.core.dto.SignupDto;
import skku.gymbarofit.core.exception.BusinessException;
import skku.gymbarofit.core.exception.ErrorCode;
import skku.gymbarofit.core.repository.UserRepository;

import java.util.Optional;

@Slf4j
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
        // 1. 중복 회원 검증
        validateDuplicateUser(form.getEmail());

        // 2. 회원 객체 생성
        User user = User.createUser(form, passwordEncoder);

        // 3. 회원 저장
        userRepository.save(user);

        // 4. 회원 id 반환
        return user.getId();
    }

//    /**
//     * 로그인
//     */
//    public User login(String email, String password) {
//        // 1. 이메일로 유저 검색
//        User findUser = userRepository.findByEmail(email)
//                .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_FOUND));
//
//        // 2. 비밀번호 검증
//        findUser.passwordAuthenticate(password, passwordEncoder);
//
//        return findUser;
//    }

    /**
     * 유저 검색
     */
    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }


    private void validateDuplicateUser(String email) {
        userRepository.findByEmail(email)
                .ifPresent(member -> {
                    log.info("Duplicated Email used");
                    throw new BusinessException(ErrorCode.DUPLICATED_EMAIL_USED);
                });
    }

}
