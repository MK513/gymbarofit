package skku.gymbarofit.core.gym;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.gym.enums.GymCrowdLevel;
import skku.gymbarofit.core.user.owner.Owner;

import java.util.ArrayList;
import java.util.List;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
public class Gym extends BaseTimeEntity {

    @Id
    @GeneratedValue
    @Column(name = "gym_id")
    private Long id;

    private String name;

    private String postalCode;

    private String address;

    private int currentOccupancy;

    private int maxCapacity;

    @Enumerated(EnumType.STRING)
    @Column(name = "crowd_level")
    private GymCrowdLevel crowdLevel;

    @ManyToOne(fetch = LAZY, optional = true)
    @JoinColumn(name = "owner_id")
    private Owner owner;

    @OneToMany(mappedBy = "gym", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GymOperatingHour> operatingHours = new ArrayList<>();

    public static Gym create(String name, String postalCode, String address, int maxCapacity, Owner owner) {
        Gym gym = new Gym();
        gym.name = name;
        gym.postalCode = postalCode;
        gym.address = address;
        gym.maxCapacity = maxCapacity;
        gym.currentOccupancy = 0;
        gym.crowdLevel = GymCrowdLevel.VERY_COMFORTABLE;
        gym.owner = owner;
        return gym;
    }
}
