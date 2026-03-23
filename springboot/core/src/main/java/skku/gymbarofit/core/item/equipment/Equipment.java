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

    @Embedded
    private ItemInfo itemInfo;

    private Integer gridX;

    private Integer gridY;

    private Integer spanW;

    private Integer spanH;

    public static Equipment create(Gym gym, String name, String type, String imageUrl, Integer gridX, Integer gridY) {
        Equipment e = new Equipment();
        e.gym = gym;
        e.type = type;
        e.imageUrl = imageUrl;
        e.itemInfo = ItemInfo.create(name, ItemStatus.OK);
        e.gridX = gridX;
        e.gridY = gridY;
        return e;
    }

    public void updatePosition(Integer gridX, Integer gridY, Integer spanW, Integer spanH) {
        this.gridX = gridX;
        this.gridY = gridY;
        this.spanW = spanW;
        this.spanH = spanH;
    }

    public void update(String name, String type, String imageUrl) {
        this.itemInfo = ItemInfo.create(name, this.itemInfo.getStatus());
        this.type = type;
        this.imageUrl = imageUrl;
    }

    public void updateStatus(ItemStatus status) {
        this.itemInfo = ItemInfo.create(this.itemInfo.getName(), status);
    }

    /** 기구 종류명으로부터 카테고리 enum 명을 반환 (예: "CARDIO") */
    public String getCategory() {
        return EquipmentType.fromFilename(this.type).name();
    }

    /** MET 값을 DB에 저장하지 않고 EquipmentType enum에서 실시간 계산 */
    public float getMet() {
        return (float) EquipmentType.fromFilename(this.type).getDefaultMet();
    }
}
