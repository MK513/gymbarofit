package skku.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user")
@Getter @Setter
public class User {

    @Id @GeneratedValue
    private int id;
    private int role_id;
    private String name;
    private String email;
    private String pw_hash;
    private String pnumber;
    private String address;
    private String gender;
    private LocalDateTime created_at;
}
