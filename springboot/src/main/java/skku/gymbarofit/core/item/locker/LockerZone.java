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

    private int totalCount;

    private int rowCount;

    private int columnCount;

}
