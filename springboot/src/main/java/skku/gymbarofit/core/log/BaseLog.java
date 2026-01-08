package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.Gym;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.user.member.Member;

import java.time.Duration;
import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.*;

@MappedSuperclass
@Getter
public abstract class BaseLog extends BaseTimeEntity {

    @Id
    @GeneratedValue
    @Column(name = "log_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Transient
    public Duration getDuration() {
        if (startTime == null || endTime == null) return Duration.ZERO;
        return Duration.between(startTime, endTime);
    }
}
