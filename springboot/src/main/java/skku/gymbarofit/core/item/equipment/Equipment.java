package skku.gymbarofit.core.item.equipment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.ItemInfo;

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

    @Embedded
    private ItemInfo itemInfo;

    //TODO: 일단 string인데 이후에 리액트 보고 좌표값으로 수정 필요
    private String location;
}
