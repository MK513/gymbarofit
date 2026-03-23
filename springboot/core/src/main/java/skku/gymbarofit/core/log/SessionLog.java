package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.*;

@MappedSuperclass
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public abstract class SessionLog {

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime occurredAt;

}
