package skku.gymbarofit.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import skku.gymbarofit.domain.log.UserActivityLog;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "users")
@Getter @Setter
public class User {

    @Id @GeneratedValue
    @Column(name = "user_id")
    private Long id;

    private String name;

    @OneToOne(fetch = LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "role_id")
    private Role role;

    private String email;

    private String pw_hash;

    private String phoneNumber;

    private String address;

    @Enumerated(EnumType.STRING)
    private GenderStatus gender;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<UserActivityLog> logs = new ArrayList<>();

    private LocalDateTime created_at;
}
