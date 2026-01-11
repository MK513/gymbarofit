package skku.gymbarofit.core.payment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "payment",
        indexes = {
                @Index(name = "idx_payment_member", columnList = "member_id"),
                @Index(name = "idx_payment_paid_at", columnList = "paid_at")
        }
)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    /** 결제자 */
    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    /** 결제 금액 */
    @Column(nullable = false)
    private int amount;

    /** 결제 상태 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    /** 결제 수단 */
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    /** 결제 완료 시각 */
    @Column(name = "paid_at", nullable = false)
    private LocalDateTime paidAt;

    public Payment(Member member,
                   int amount,
                   PaymentMethod paymentMethod) {

        this.member = member;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.status = PaymentStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }

    /* ================= 비즈니스 메서드 ================= */

    public void refund() {
        if (this.status == PaymentStatus.REFUNDED) {
            return;
        }
        this.status = PaymentStatus.REFUNDED;
    }
}