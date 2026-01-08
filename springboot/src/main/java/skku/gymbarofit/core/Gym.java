package skku.gymbarofit.core;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.item.Locker;
import skku.gymbarofit.core.user.owner.Owner;

import java.time.LocalTime;
import java.util.List;

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

    @ManyToOne(fetch = LAZY)
    private Owner owner;

    private LocalTime openAt;

    private LocalTime closeAt;

}
