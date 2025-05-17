package skku.gymbarofit.domain.log;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.domain.User;

import java.time.Duration;
import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
@Getter
public class UserActivityLog {

    @Id
    @GeneratedValue
    @Column(name = "usage_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime start_time;

    private LocalDateTime end_time;

    private Duration duration;

    private LocalDateTime created_at;
}
