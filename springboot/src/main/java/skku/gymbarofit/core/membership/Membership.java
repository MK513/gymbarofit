package skku.gymbarofit.core.membership;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.membership.enums.MembershipStatus;
import skku.gymbarofit.core.user.enums.UserRole;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.*;

@Entity
@Getter
public class Membership {

    @Id
    @GeneratedValue
    @Column(name = "membership_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id")
    private Member member;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @Enumerated(EnumType.STRING)
    private MembershipStatus status;

    private LocalDateTime joinedAt;

    private LocalDateTime expiredAt;

    @Enumerated(EnumType.STRING)
    private UserRole role;
}
