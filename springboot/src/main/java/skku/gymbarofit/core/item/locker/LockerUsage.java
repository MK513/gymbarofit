package skku.gymbarofit.core.item.locker;

import jakarta.persistence.*;
import lombok.*;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.locker.dto.LockerRentRequestDto;
import skku.gymbarofit.core.item.locker.enums.LockerPlan;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDate;

import static jakarta.persistence.FetchType.*;

@Entity
@Table(
    name = "locker_usage",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_locker_active", columnNames = {"locker_id", "active"}),
        @UniqueConstraint(name = "uk_gym_member_active", columnNames = {"gym_id", "user_id", "active"})
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class LockerUsage {

    @Id @GeneratedValue
    @Column(name = "locker_usage_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id")
    private Member member;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "locker_id")
    private Locker locker;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @Enumerated(EnumType.STRING)
    private LockerPlan plan;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private LockerUsageStatus status;

    private Integer active;

    public static LockerUsage from(Member member, Locker locker, Gym gym, LockerRentRequestDto request) {
        return LockerUsage.builder()
                .member(member)
                .locker(locker)
                .gym(gym)
                .plan(request.plan())
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(request.plan().getMonths()))
                .status(LockerUsageStatus.PENDING)
                .active(1)
                .build();
    }

    /* ================= 비즈니스 메서드 ================= */

    /** 만료 처리 (스케줄러용) */
    public void expire() {
        this.status = LockerUsageStatus.EXPIRED;
        this.active = null;
    }

    /** 중도 취소 */
    public void cancel() {
        this.status = LockerUsageStatus.CANCELLED;
        this.active = null;
    }

    /** 연장 (같은 플랜 or 다른 플랜 가능) */
    public void extend(LockerPlan newPlan) {
        this.plan = newPlan;
        this.endDate = this.endDate.plusMonths(newPlan.getMonths());
    }

    public void confirm(Payment payment) {
        this.payment = payment;
        this.status = LockerUsageStatus.ACTIVE;
        this.active = 1;
    }

    public boolean isActive() {
        return Integer.valueOf(1).equals(this.active);
    }
}
