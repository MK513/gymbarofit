package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.GymItem;

import static jakarta.persistence.FetchType.*;

@Entity
@DiscriminatorValue("gymitem")
@Getter
public class GymItemLog extends UserActivityLog {

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gymitem_id")
    private GymItem gymitem;

}
