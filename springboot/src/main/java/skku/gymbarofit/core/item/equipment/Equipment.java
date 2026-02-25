package skku.gymbarofit.core.item.equipment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.ItemInfo;
import skku.gymbarofit.core.item.enums.ItemStatus;

@Entity
@Getter
public class Equipment{

    @Id
    @GeneratedValue
    @Column(name = "equipment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    private String type;

    private String imageUrl;

    private String serialNumber;

    private float met;

    @Embedded
    private ItemInfo itemInfo;

    //TODO: 일단 string인데 이후에 리액트 보고 좌표값으로 수정 필요
    private String location;

    public static Equipment create(Gym gym, String name, String type, String imageUrl) {
        Equipment e = new Equipment();
        e.gym = gym;
        e.type = type;
        e.imageUrl = imageUrl;
        e.itemInfo = ItemInfo.create(name, ItemStatus.OK);
        return e;
    }
}
