package skku.gymbarofit.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;


// 추후 spring security 쓰도록 변형 예정
// 임시 구현체임
@Entity
@Getter
@Setter
public class Role {

    @Id
    @GeneratedValue
    @Column(name = "role_id")
    private Long id;

    private String name;

    private String description;
}
