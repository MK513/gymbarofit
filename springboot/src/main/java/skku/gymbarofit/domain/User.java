package skku.gymbarofit.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import skku.gymbarofit.domain.log.UserActivityLog;
import skku.gymbarofit.dto.SignupDto;
import skku.gymbarofit.exception.BusinessException;
import skku.gymbarofit.exception.ErrorCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "users")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class User {

    @Id @GeneratedValue
    @Column(name = "user_id")
    private Long id;

    private String name;

    private String role; // MEMBER, ADMIN

    @Column(unique = true)
    private String email;

    private String password;

    private String phone_number;

    private String address;

    private String gender;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserActivityLog> logs = new ArrayList<>();

    private LocalDateTime created_at;

    // 테스트용, 비밀번호 암호화x
    public static User createUser(SignupDto userSignupForm) {
        return User.builder()
                .name(userSignupForm.getName())
                .email(userSignupForm.getEmail())
                .password(userSignupForm.getPassword())
                .phone_number(userSignupForm.getPhone_number())
                .address(userSignupForm.getAddress())
                .gender(userSignupForm.getGender())
                .role(userSignupForm.getRole())
                .build();
    }

    public static User createUser(SignupDto userSignupForm, PasswordEncoder passwordEncoder) {
        return User.builder()
                .name(userSignupForm.getName())
                .email(userSignupForm.getEmail())
                .password(passwordEncoder.encode(userSignupForm.getPassword()))
                .phone_number(userSignupForm.getPhone_number())
                .address(userSignupForm.getAddress())
                .gender(userSignupForm.getGender())
                .role(userSignupForm.getRole())
                .build();
    }

    public void passwordAuthenticate(String rawPassword, PasswordEncoder passwordEncoder) {
        if (!passwordEncoder.matches(rawPassword, this.password)) {
            throw new BusinessException(ErrorCode.PASSWORD_DISMATCH);
        }
    }
}
