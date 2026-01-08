package skku.gymbarofit.core.item;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.global.enums.SizeStatus;

@Entity
@Getter
public class Locker{

    @Id
    @GeneratedValue
    @Column(name = "locker_id")
    private Long id;

    private int lockerNumber;

    @Enumerated(EnumType.STRING)
    private SizeStatus size;

    @Embedded
    private ItemInfo itemInfo;


}
