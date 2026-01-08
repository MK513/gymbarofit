package skku.gymbarofit.core.item;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Equipment{

    @Id
    @GeneratedValue
    @Column(name = "equipment_id")
    private Long id;

    private String modelName;

    private int serialNumber;

    @Embedded
    private ItemInfo itemInfo;

    //TODO: 일단 string인데 이후에 리액트 보고 좌표값으로 수정 필요
    private String location;
}
