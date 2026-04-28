package skku.gymbarofit.core.log.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.log.AccessLog;

import java.sql.Date;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {

    /**
     * 헬스장의 시간대별 방문 건수를 반환한다.
     * 반환 배열: [0]=hour(int), [1]=count(long)
     */
    @Query(value = """
<<<<<<< HEAD
            SELECT EXTRACT(HOUR FROM occurred_at) AS hr, COUNT(*) AS cnt
            FROM access_log
            WHERE gym_id = :gymId
            GROUP BY hr
            ORDER BY hr
=======
            SELECT HOUR(occurred_at) AS hr, COUNT(*) AS cnt
            FROM access_log
            WHERE gym_id = :gymId
            GROUP BY HOUR(occurred_at)
            ORDER BY HOUR(occurred_at)
>>>>>>> origin/main
            """, nativeQuery = true)
    List<Object[]> countByGymGroupByHour(@Param("gymId") Long gymId);

    /** 현재 체크아웃하지 않은 가장 최근 체크인 로그 조회 (write path — SELECT FOR UPDATE) */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM AccessLog a WHERE a.member.id = :memberId AND a.gym.id = :gymId AND a.checkedOutAt IS NULL ORDER BY a.occurredAt DESC LIMIT 1")
    Optional<AccessLog> findForUpdate(@Param("memberId") Long memberId, @Param("gymId") Long gymId);

    /** 현재 체크아웃하지 않은 가장 최근 체크인 로그 조회 (read path) */
    @Query("SELECT a FROM AccessLog a WHERE a.member.id = :memberId AND a.gym.id = :gymId AND a.checkedOutAt IS NULL ORDER BY a.occurredAt DESC LIMIT 1")
    Optional<AccessLog> find(@Param("memberId") Long memberId, @Param("gymId") Long gymId);

    /** 특정 시간 범위 내 체크인 여부 */
    boolean existsByMemberIdAndGymIdAndOccurredAtBetween(
            Long memberId, Long gymId, LocalDateTime start, LocalDateTime end);

    /** 연속 출석 계산용: 최근 30일 내 출석한 날짜 목록 (최신순) */
    @Query(value = """
            SELECT DISTINCT CAST(occurred_at AS DATE)
            FROM access_log
            WHERE member_id = :memberId AND gym_id = :gymId
              AND occurred_at >= :since
            ORDER BY 1 DESC
            """, nativeQuery = true)
    List<Date> findDistinctAccessDatesSince(
            @Param("memberId") Long memberId,
            @Param("gymId") Long gymId,
            @Param("since") LocalDateTime since);
}
