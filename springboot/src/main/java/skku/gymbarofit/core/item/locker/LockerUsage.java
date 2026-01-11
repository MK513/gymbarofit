package skku.gymbarofit.core.item.locker;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import skku.gymbarofit.core.item.locker.enums.LockerPlan;
import skku.gymbarofit.core.item.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDate;

import static jakarta.persistence.FetchType.*;

@Entity
@Getter
@NoArgsConstructor
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

    @Enumerated(EnumType.STRING)
    private LockerPlan plan;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private LockerUsageStatus status;


    /* ================= 비즈니스 메서드 ================= */

    /** 만료 처리 (스케줄러용) */
    public void expire() {
        this.status = LockerUsageStatus.EXPIRED;
    }

    /** 중도 취소 */
    public void cancel() {
        this.status = LockerUsageStatus.CANCELLED;
    }

    /** 연장 (같은 플랜 or 다른 플랜 가능) */
    public void extend(LockerPlan newPlan) {
        this.plan = newPlan;
        this.endDate = this.endDate.plusMonths(newPlan.getMonths());
    }

    /** 현재 유효한 사용인지 */
    public boolean isActive(LocalDate today) {
        return status == LockerUsageStatus.ACTIVE && !endDate.isBefore(today);
    }
}
