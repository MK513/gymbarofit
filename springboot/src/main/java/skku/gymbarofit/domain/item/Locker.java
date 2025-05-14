package skku.gymbarofit.domain.item;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;

@Entity
@DiscriminatorValue("L")
@Getter
public class Locker extends Item{

    private boolean is_private;
    private int locker_number;
}
