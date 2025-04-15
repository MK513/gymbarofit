package skku.gymbarofit.domain.item;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("L")
@Getter
@Setter
public class Locker extends Item{

    private boolean is_private;
    private int locker_number;
}
