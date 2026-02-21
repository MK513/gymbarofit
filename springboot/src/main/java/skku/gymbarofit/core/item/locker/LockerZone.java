package skku.gymbarofit.core.item.locker;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.enums.SizeStatus;

import static jakarta.persistence.FetchType.*;

@Entity
@Getter
public class LockerZone {

    @Id @GeneratedValue
    @Column(name = "lockerzone_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private SizeStatus lockerSize;

    private int rowCount;

    private int columnCount;

    @Transient
    public int getTotalCount() {
        return rowCount * columnCount;
    }

    public static LockerZone create(Gym gym, String name, SizeStatus size, int rowCount, int columnCount) {
        LockerZone zone = new LockerZone();
        zone.gym = gym;
        zone.name = name;
        zone.lockerSize = size;
        zone.rowCount = rowCount;
        zone.columnCount = columnCount;
        return zone;
    }
}
