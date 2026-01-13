package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.user.member.Member;

import java.time.Duration;
import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.*;

@MappedSuperclass
@Getter
@EntityListeners(AuditingEntityListener.class)
public abstract class SessionLog {

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    @Transient
    public Duration getDuration() {
        if (startAt == null || endAt == null) return Duration.ZERO;
        return Duration.between(startAt, endAt);
    }
    @Transient
    public void end(LocalDateTime now) {
        if (this.endAt != null) return; // 이미 종료된 세션이면 무시 or 예외
        this.endAt = now;
    }
}
