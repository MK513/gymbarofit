package skku.gymbarofit.domain.item;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import skku.gymbarofit.domain.SizeStatus;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
@Getter
@Setter
public class Item {

    @Id
    @GeneratedValue
    @Column(name = "item_id")
    private Long id;

    private String name;

    private String type;

    @Enumerated(EnumType.STRING)
    private SizeStatus size;
}
