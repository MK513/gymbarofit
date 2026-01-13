package skku.gymbarofit.core.gym;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.gym.enums.GymCrowdLevel;

import java.time.LocalTime;

@Entity
@Getter
public class Gym extends BaseTimeEntity {

    @Id
    @GeneratedValue
    @Column(name = "gym_id")
    private Long id;

    private String name;

    private String address;

    private int currentOccupancy;

    private int maxCapacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "crowd_level")
    private GymCrowdLevel crowdLevel;

    private LocalTime openAt;

    private LocalTime closeAt;

}
