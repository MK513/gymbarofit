package skku.gymbarofit.core.item.enums;

public enum SizeStatus {
    SMALL("S", "소"),
    MEDIUM("M", "중"),
    BIG("L", "대");

    private final String code;
    private final String description;

    SizeStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
