package skku.gymbarofit.core.item;


import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.Gym;
import skku.gymbarofit.core.Reservation;
import skku.gymbarofit.core.global.enums.ItemStatus;

import static jakarta.persistence.FetchType.LAZY;

@Embeddable
@Getter
public class ItemInfo {

    private String displayName;

    private String type;

    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

    @OneToOne(fetch = LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;
}
