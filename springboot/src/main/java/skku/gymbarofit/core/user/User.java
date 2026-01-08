package skku.gymbarofit.core.user;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.global.enums.UserRole;

@MappedSuperclass
@Getter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class User extends BaseTimeEntity {

    @Id @GeneratedValue
    @Column(name = "user_id")
    private Long id;

    private String username;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(unique = true)
    private String email;

    private String password;

    private String phoneNumber;

    private String address;

    public User(User user, UserRole role) {
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = role;
        this.phoneNumber = user.getPhoneNumber();
        this.address = user.getAddress();
    }

}
