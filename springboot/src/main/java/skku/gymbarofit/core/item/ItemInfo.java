package skku.gymbarofit.core.item;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.item.enums.ItemCondition;

@Embeddable
@Getter
public class ItemInfo {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @Enumerated(EnumType.STRING)
    private ItemCondition condition;

}
