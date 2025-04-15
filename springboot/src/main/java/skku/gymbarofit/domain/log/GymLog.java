package skku.gymbarofit.domain.log;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import skku.gymbarofit.domain.Gym;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@DiscriminatorValue("gym")
@Getter @Setter
public class GymLog extends UserActivityLog{

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id")
    private Gym gym;

}
