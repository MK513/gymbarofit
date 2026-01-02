package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.Gym;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@DiscriminatorValue("gym")
@Getter
public class GymLog extends UserActivityLog {

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

}
