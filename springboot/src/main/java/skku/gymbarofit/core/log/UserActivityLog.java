package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
@Getter
public class UserActivityLog {

    @Id
    @GeneratedValue
    @Column(name = "usage_id")
    private Long id;

    private LocalDateTime start_time;

    private LocalDateTime end_time;

    private Duration duration;

    private LocalDateTime created_at;
}
