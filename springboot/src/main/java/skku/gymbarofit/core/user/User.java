package skku.gymbarofit.core.user;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import skku.gymbarofit.core.BaseTimeEntity;

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

    private UserRole role;

    @Column(unique = true)
    private String email;

    private String password;

    private String phoneNumber;

    private String address;

}
