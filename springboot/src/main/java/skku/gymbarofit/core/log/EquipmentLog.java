package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.*;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.log.enums.EquipmentEventType;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDateTime;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class EquipmentLog extends SessionLog {

    @Id
    @GeneratedValue
    @Column(name = "equipment_log_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    private EquipmentEventType type;

    @Builder
    public EquipmentLog(
            Member member,
            Gym gym,
            LocalDateTime occurredAt,
            EquipmentEventType type,
            Long id,
            Equipment equipment
    ) {
        super(member, gym, occurredAt);
        this.id = id;
        this.equipment = equipment;
        this.type = type;
    }

    public static EquipmentLog from(EquipmentUsage usage, EquipmentEventType type) {
        return EquipmentLog.builder()
                .member(usage.getMember())
                .gym(usage.getGym())
                .occurredAt(LocalDateTime.now())
                .type(type)
                .equipment(usage.getEquipment())
                .build();
    }
}
