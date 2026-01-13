package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.item.locker.Locker;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
public class LockerLog extends SessionLog {

    @Id
    @GeneratedValue
    @Column(name = "locker_log_id")
    private Long id;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "locker_id")
    private Locker locker;
}
