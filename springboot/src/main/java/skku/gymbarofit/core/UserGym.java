package skku.gymbarofit.core;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.user.Owner;
import skku.gymbarofit.core.user.User;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.*;

@Entity
@Getter
public class UserGym {

    @Id
    @GeneratedValue
    @Column(name = "usergym_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id")
    private Owner owner;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    private boolean inGym;

    private LocalDateTime joined_at;

    private LocalDateTime expired_at;
}
