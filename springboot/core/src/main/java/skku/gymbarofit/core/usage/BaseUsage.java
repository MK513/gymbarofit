package skku.gymbarofit.core.usage;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import skku.gymbarofit.core.global.domain.BaseTimeEntity;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.user.member.Member;

import static jakarta.persistence.FetchType.LAZY;

@MappedSuperclass
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// BaseTimeEntity(createdAt, updatedAt)도 상속받아 생성 시간(줄서기 순서 등) 활용
public abstract class BaseUsage extends BaseTimeEntity {

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    protected Member member;

    @ManyToOne(fetch = LAZY)
    @JoinColumn(name = "gym_id", nullable = false)
    protected Gym gym;

    // 생성자 (자식 클래스에서 호출용)
    protected BaseUsage(Member member, Gym gym) {
        this.member = member;
        this.gym = gym;
    }
}