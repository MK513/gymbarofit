package skku.gymbarofit.core.log;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Getter;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.user.member.Member;

import java.time.LocalDateTime;

@Entity
@Getter
public class AccessLog extends SessionLog {

    @Id
    @GeneratedValue
    @Column(name = "access_log_id")
    private Long id;

    @Column(name = "checked_out_at")
    private LocalDateTime checkedOutAt;

    public static AccessLog create(Member member, Gym gym) {
        return new AccessLog(member, gym);
    }

    protected AccessLog(Member member, Gym gym) {
        super(member, gym, null);
    }

    protected AccessLog() {}

    public void checkOut() {
        this.checkedOutAt = LocalDateTime.now();
    }
}
