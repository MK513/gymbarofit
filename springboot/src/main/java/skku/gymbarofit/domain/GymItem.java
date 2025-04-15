package skku.gymbarofit.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import skku.gymbarofit.domain.item.Item;

@Entity
@Getter
@Setter
public class GymItem {

    @Id
    @GeneratedValue
    @Column(name = "gymitem_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    private String display_name;

    // 추후 matrix 등의 loc 저장 수단 결정시 수정
    private String location;
}
