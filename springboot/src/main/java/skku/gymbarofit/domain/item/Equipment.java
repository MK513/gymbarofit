package skku.gymbarofit.domain.item;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;

@Entity
@DiscriminatorValue("E")
@Getter
public class Equipment extends Item{

    private String model_name;
    private int serial_number;
}
