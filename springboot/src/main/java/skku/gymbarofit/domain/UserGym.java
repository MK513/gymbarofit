package skku.gymbarofit.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.*;

@Entity
@Getter @Setter
public class UserGym {

    @Id
    @GeneratedValue
    @Column(name = "usergym_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    private boolean inGym;

    private LocalDateTime joined_at;

    private LocalDateTime expired_at;
}
