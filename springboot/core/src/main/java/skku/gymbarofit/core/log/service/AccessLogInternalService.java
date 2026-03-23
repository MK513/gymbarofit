package skku.gymbarofit.core.log.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.log.AccessLog;
import skku.gymbarofit.core.log.dto.AccessStatusDto;
import skku.gymbarofit.core.log.exception.AccessErrorCode;
import skku.gymbarofit.core.log.exception.AccessException;
import skku.gymbarofit.core.log.repository.AccessLogRepository;
import skku.gymbarofit.core.user.member.Member;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AccessLogInternalService {

    private final AccessLogRepository accessLogRepository;

    public AccessLog checkIn(Member member, Gym gym) {
        boolean alreadyCheckedIn = accessLogRepository
                .findTopByMemberIdAndGymIdAndCheckedOutAtIsNullOrderByOccurredAtDesc(
                        member.getId(), gym.getId())
                .isPresent();
        if (alreadyCheckedIn) {
            throw new AccessException(AccessErrorCode.ALREADY_CHECKED_IN);
        }
        gym.checkIn();
        AccessLog accessLog = AccessLog.create(member, gym);
        return accessLogRepository.save(accessLog);
    }

    public AccessLog checkOut(Long memberId, Long gymId, Gym gym) {
        AccessLog accessLog = accessLogRepository
                .findTopByMemberIdAndGymIdAndCheckedOutAtIsNullOrderByOccurredAtDesc(memberId, gymId)
                .orElseThrow(() -> new AccessException(AccessErrorCode.NOT_CHECKED_IN));
        accessLog.checkOut();
        gym.checkOut();
        return accessLog;
    }

    @Transactional(readOnly = true)
    public AccessStatusDto getAccessStatus(Long memberId, Long gymId) {
        Optional<AccessLog> openLog = accessLogRepository
                .findTopByMemberIdAndGymIdAndCheckedOutAtIsNullOrderByOccurredAtDesc(memberId, gymId);

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(LocalTime.MAX);
        boolean checkedToday = accessLogRepository
                .existsByMemberIdAndGymIdAndOccurredAtBetween(memberId, gymId, todayStart, todayEnd);

        int streak = calculateStreak(memberId, gymId);

        if (openLog.isPresent()) {
            return AccessStatusDto.checkedIn(openLog.get().getOccurredAt(), streak);
        }
        return AccessStatusDto.notCheckedIn(checkedToday, streak);
    }

    private int calculateStreak(Long memberId, Long gymId) {
        LocalDateTime since = LocalDate.now().minusDays(30).atStartOfDay();
        List<Date> rawDates = accessLogRepository
                .findDistinctAccessDatesSince(memberId, gymId, since);

        if (rawDates.isEmpty()) return 0;

        List<LocalDate> dates = rawDates.stream()
                .map(Date::toLocalDate)
                .toList();

        int streak = 0;
        LocalDate expected = LocalDate.now();

        for (LocalDate date : dates) {
            if (date.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else {
                break;
            }
        }
        return streak;
    }
}
