package skku.gymbarofit.core.reservation;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.reservation.enums.ReservationStatus;
import skku.gymbarofit.core.user.member.Member;


import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
public class Reservation extends BaseTimeEntity {

    @Id
    @GeneratedValue
    @Column(name = "reservation_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;
}
