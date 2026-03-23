package skku.gymbarofit.core.item.locker.dto;

public record LockerStatusUpdateRequestDto(String status) {
    // status: "OK" | "BROKEN" | "MAINTENANCE" | "RETIRED"
}
