package skku.gymbarofit.core.log;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;

@Entity
@Getter
public class AccessLog extends SessionLog {

    @Id
    @GeneratedValue
    @Column(name = "access_log_id")
    private Long id;
}
