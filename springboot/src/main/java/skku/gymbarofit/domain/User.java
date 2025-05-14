package skku.gymbarofit.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import skku.gymbarofit.domain.log.UserActivityLog;
import skku.gymbarofit.domain.status.GenderStatus;
import skku.gymbarofit.domain.status.RoleStatus;
import skku.gymbarofit.dto.UserDto;

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

    private String email;

    private String pw_hash;

    private String phone_number;

    private String address;

    @Enumerated(EnumType.STRING)
    private GenderStatus gender;

    @Builder.Default
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserActivityLog> logs = new ArrayList<>();

    private LocalDateTime created_at;

    public static User createUser(UserDto userDto) {
        return User.builder()
                .name(userDto.getName())
                .email(userDto.getEmail())
                .pw_hash(userDto.getPw_hash())
                .phone_number(userDto.getPhone_number())
                .address(userDto.getAddress())
                .gender(userDto.getGenderStatus())
                .build();
    }
}
