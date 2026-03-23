package skku.gymbarofit.api.user.owner.dto;

public record DayScheduleDto(
        String dayOfWeek,  // "MONDAY" ~ "SUNDAY"
        String openAt,     // "HH:mm", closed=true이면 null
        String closeAt,    // "HH:mm", closed=true이면 null
        boolean closed
) {}
