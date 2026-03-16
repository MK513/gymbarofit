package skku.gymbarofit.core.gym;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
@Table(name = "GYM_OPERATING_HOUR")
public class GymOperatingHour {

    @Id
    @GeneratedValue
    @Column(name = "operating_hour_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private DayOfWeek dayOfWeek;

    private LocalTime openAt;   // 휴무일이면 null

    private LocalTime closeAt;  // 휴무일이면 null

    private boolean closed;

    public static GymOperatingHour create(Gym gym, DayOfWeek dayOfWeek,
                                          LocalTime openAt, LocalTime closeAt, boolean closed) {
        GymOperatingHour hour = new GymOperatingHour();
        hour.gym = gym;
        hour.dayOfWeek = dayOfWeek;
        hour.openAt = openAt;
        hour.closeAt = closeAt;
        hour.closed = closed;
        return hour;
    }
}
