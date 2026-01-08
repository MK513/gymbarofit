package skku.gymbarofit.core.global.enums;

public enum Gender {

    MALE("M", "남성"),
    FEMALE("F", "여성"),
    OTHER("O", "기타");

    private final String code;
    private final String description;

    Gender(String code, String description) {
        this.code = code;
        this.description = description;
    }
}
