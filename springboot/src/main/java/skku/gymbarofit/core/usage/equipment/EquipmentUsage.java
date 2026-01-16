package skku.gymbarofit.core.usage.equipment;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.usage.BaseUsage;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.user.member.Member;

import java.time.Duration;
import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(
    name = "equipment_usage",
    uniqueConstraints = {
        @UniqueConstraint(
                name = "uk_equipment_usage_member_status",
                columnNames = {"user_id", "active_status"}
        )
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EquipmentUsage extends BaseUsage {

    @Id
    @GeneratedValue
    @Column(name = "equipment_usage_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    private EquipmentUsageStatus status;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    // 최종 사용 시간
    private int durationMinutes;

    private String activeStatus;

    @PrePersist
    @PreUpdate
    private void syncActiveStatus() {
        if (status == EquipmentUsageStatus.WAITING
                || status == EquipmentUsageStatus.IN_USE
                || status == EquipmentUsageStatus.CALLED) {
            this.activeStatus = status.name();
        } else {
            this.activeStatus = null;
        }
    }

    @Builder
    public EquipmentUsage(Member member, Gym gym, Equipment equipment, EquipmentUsageStatus status, LocalDateTime startTime) {
        super(member, gym);
        this.equipment = equipment;
        this.status = status;
        this.startTime = startTime;
    }

    // [1] 줄서기 신청 (대기열 진입)
    public static EquipmentUsage createQueue(Member member, Gym gym, Equipment equipment) {
        return EquipmentUsage.builder()
                .member(member)
                .gym(gym)
                .equipment(equipment)
                .status(EquipmentUsageStatus.WAITING)
                .build();
    }

    public static EquipmentUsage of(Member member, Gym gym, Equipment equipment) {
        return EquipmentUsage.builder()
                .member(member)
                .gym(gym)
                .equipment(equipment)
                .status(EquipmentUsageStatus.IN_USE)
                .startTime(LocalDateTime.now())
                .build();
    }

    // 사용 시작
    public void startUse() {
        if (this.status == EquipmentUsageStatus.WAITING) {
            this.status = EquipmentUsageStatus.IN_USE;
            this.startTime = LocalDateTime.now();
        }
    }

    // 사용 종료
    public void completeUse() {
        this.status = EquipmentUsageStatus.COMPLETED;
        this.endTime = LocalDateTime.now();
        this.durationMinutes = (int) Duration.between(startTime, LocalDateTime.now()).toMinutes();
    }

}
