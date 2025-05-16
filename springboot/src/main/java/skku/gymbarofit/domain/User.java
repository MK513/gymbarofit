package skku.gymbarofit.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.crypto.password.PasswordEncoder;
import skku.gymbarofit.domain.log.UserActivityLog;
import skku.gymbarofit.domain.status.GenderStatus;
import skku.gymbarofit.domain.status.RoleStatus;
import skku.gymbarofit.dto.UserSignupDto;
import skku.gymbarofit.exception.BusinessException;
import skku.gymbarofit.exception.ErrorCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Table(name = "users")
@Builder
public class User {

    @Id @GeneratedValue
    @Column(name = "user_id")
    private Long id;

    private String name;

    @Enumerated(EnumType.STRING)
    private RoleStatus role;

    @Column(unique = true)
    private String email;

    private String password;

    private String phone_number;

    private String address;

    @Enumerated(EnumType.STRING)
    private GenderStatus gender;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserActivityLog> logs = new ArrayList<>();

    private LocalDateTime created_at;

    // 테스트용, 비밀번호 암호화x
    public static User createUser(UserSignupDto userSignupForm) {
        return User.builder()
                .name(userSignupForm.getName())
                .email(userSignupForm.getEmail())
                .password(userSignupForm.getPassword())
                .phone_number(userSignupForm.getPhone_number())
                .address(userSignupForm.getAddress())
                .gender(userSignupForm.getGenderStatus())
                .build();
    }

    public static User createUser(UserSignupDto userSignupForm, PasswordEncoder encoder) {
        return User.builder()
                .name(userSignupForm.getName())
                .email(userSignupForm.getEmail())
                .password(encoder.encode(userSignupForm.getPassword()))
                .phone_number(userSignupForm.getPhone_number())
                .address(userSignupForm.getAddress())
                .gender(userSignupForm.getGenderStatus())
                .build();
    }

    public void passwordAuthenticate(String rawPassword, PasswordEncoder encoder) {
        if (!encoder.matches(rawPassword, this.password)) {
            throw new BusinessException(ErrorCode.PASSWORD_DISMATCH);
        }
    }
}
