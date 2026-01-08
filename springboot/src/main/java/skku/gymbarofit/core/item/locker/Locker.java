package skku.gymbarofit.core.item.locker;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.item.ItemInfo;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
public class Locker{

    @Id
    @GeneratedValue
    @Column(name = "locker_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "lockerzone_id")
    private LockerZone lockerZone;

    private int lockerNumber;

    @Embedded
    private ItemInfo itemInfo;
}
