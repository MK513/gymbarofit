package skku.gymbarofit.core.log.dto;

import java.time.LocalDateTime;

public record AccessStatusDto(
        boolean checkedIn,
        LocalDateTime checkedInAt,
        boolean checkedToday,
        int streak
) {

    public static AccessStatusDto notCheckedIn(boolean checkedToday, int streak) {
        return new AccessStatusDto(false, null, checkedToday, streak);
    }

    public static AccessStatusDto checkedIn(LocalDateTime checkedInAt, int streak) {
        return new AccessStatusDto(true, checkedInAt, true, streak);
    }
}
