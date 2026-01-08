package skku.gymbarofit.core.gym;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.user.owner.Owner;

import java.time.LocalTime;

import static jakarta.persistence.FetchType.*;

@Entity
@Getter
public class Gym extends BaseTimeEntity {

    @Id
    @GeneratedValue
    @Column(name = "gym_id")
    private Long id;

    private String name;

    private String address;

    private LocalTime openAt;

    private LocalTime closeAt;

}
