package skku.gymbarofit.core.log;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.item.Locker;

import static jakarta.persistence.FetchType.LAZY;

@Entity
@Getter
public class LockerLog extends BaseLog {

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "locker_id")
    private Locker locker;
}
