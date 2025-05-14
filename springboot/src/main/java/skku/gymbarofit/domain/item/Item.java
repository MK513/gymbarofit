package skku.gymbarofit.domain.item;


import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.domain.status.SizeStatus;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype")
@Getter
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
