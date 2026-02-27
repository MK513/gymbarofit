package skku.gymbarofit.core.item.equipment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.ItemInfo;
import skku.gymbarofit.core.item.enums.EquipmentType;
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

    private String location;

    public static Equipment create(Gym gym, String name, String type, String imageUrl, String location) {
        Equipment e = new Equipment();
        e.gym = gym;
        e.type = type;
        e.imageUrl = imageUrl;
        e.itemInfo = ItemInfo.create(name, ItemStatus.OK);
        try {
            e.met = (float) EquipmentType.valueOf(type).getDefaultMet();
        } catch (IllegalArgumentException ex) {
            e.met = (float) EquipmentType.MACHINE.getDefaultMet();
        }
        e.location = location;
        return e;
    }
}
