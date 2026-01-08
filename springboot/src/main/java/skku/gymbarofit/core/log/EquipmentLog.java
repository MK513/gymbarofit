package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.item.Equipment;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
public class EquipmentLog extends BaseLog {

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

}
