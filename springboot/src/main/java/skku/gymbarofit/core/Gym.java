package skku.gymbarofit.core;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalTime;

@Entity
@Getter
public class Gym {

    @Id
    @GeneratedValue
    @Column(name = "gym_id")
    private Long id;

    private String name;

    private String address;

    private LocalTime open_time;

    private LocalTime close_time;
}
