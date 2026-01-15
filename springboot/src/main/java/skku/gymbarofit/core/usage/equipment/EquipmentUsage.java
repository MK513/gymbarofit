package skku.gymbarofit.core.usage.equipment;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.Equipment;
import skku.gymbarofit.core.usage.BaseUsage;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Table(name = "equipment_usage")
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

    private LocalDateTime startTime; // 기구는 '시간(분/초)' 기준
    private LocalDateTime endTime;

    // 예상 사용 시간 (대기 시간 계산용)
    private int durationMinutes;

    @Builder
    public EquipmentUsage(Member member, Gym gym, Equipment equipment, EquipmentUsageStatus status, int durationMinutes) {
        super(member, gym);
        this.equipment = equipment;
        this.status = status;
        this.durationMinutes = durationMinutes;
    }

    // [1] 줄서기 신청 (대기열 진입)
    public static EquipmentUsage createQueue(Member member, Gym gym, Equipment equipment) {
        return EquipmentUsage.builder()
                .member(member)
                .gym(gym)
                .equipment(equipment)
                .status(EquipmentUsageStatus.WAITING)
                .durationMinutes(40) // 기본 40분 설정 (정책에 따라 변경)
                .build();
    }

    // [2] 사용 시작 (QR 태그 시점)
    public void startUse() {
        if (this.status == EquipmentUsageStatus.WAITING) {
            this.status = EquipmentUsageStatus.IN_USE;
            this.startTime = LocalDateTime.now();
        }
    }

    // [3] 사용 종료
    public void completeUse() {
        this.status = EquipmentUsageStatus.COMPLETED;
        this.endTime = LocalDateTime.now();
    }

}
