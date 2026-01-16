package skku.gymbarofit.core.usage.equipment.enums;

public enum EquipmentUsageStatus {
    WAITING,    // 대기 중 (줄서기)
    IN_USE,     // 사용 중 (QR 태그 완료)
    CALLED,     // 사용 대기 중
    COMPLETED,  // 사용 완료
    CANCELLED,  // 대기 취소됨
    AVAILABLE   // 이용 가능
}
