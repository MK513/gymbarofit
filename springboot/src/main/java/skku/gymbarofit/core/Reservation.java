package skku.gymbarofit.core;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.status.ReservationStatus;
import skku.gymbarofit.core.user.User;


import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
public class Reservation {

    @Id
    @GeneratedValue
    @Column(name = "reservation_id")
    private Long id;

    @OneToOne(fetch = LAZY, cascade = CascadeType.ALL)
    private User user;

    @OneToOne(fetch = LAZY, cascade = CascadeType.ALL)
    private GymItem gymItem;

    private LocalDateTime start_time;

    private LocalDateTime end_time;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;

    private LocalDateTime created_at;
}
