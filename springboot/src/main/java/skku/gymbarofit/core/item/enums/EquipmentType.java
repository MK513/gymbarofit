package skku.gymbarofit.core.item.enums;

import java.util.Map;

public enum EquipmentType {

    CARDIO("유산소", 7.0),
    FREE_WEIGHT("프리웨이트", 5.0),
    MACHINE("머신", 4.0),
    STRETCHING("스트레칭", 2.5);

    private final String label;
    private final double defaultMet;

    EquipmentType(String label, double defaultMet) {
        this.label = label;
        this.defaultMet = defaultMet;
    }

    public String getLabel() { return label; }
    public double getDefaultMet() { return defaultMet; }

    private static final Map<String, EquipmentType> FILENAME_TYPE_MAP = Map.of(
            "랫풀다운",      MACHINE,
            "러닝머신",      CARDIO,
            "레그프레스",    MACHINE,
            "벤치프레스",    FREE_WEIGHT,
            "사이클",        CARDIO,
            "스미스머신",    MACHINE,
            "케이블 머신",   MACHINE,
            "바벨 스쿼트랙", FREE_WEIGHT
    );

    /**
     * 기구 종류명(또는 파일명)으로부터 카테고리 유형을 반환한다.
     * 파일명인 경우 확장자·크기 접미사를 제거 후 매핑한다.
     * 매핑에 없는 경우 기본값 MACHINE을 반환한다.
     */
    public static EquipmentType fromFilename(String filename) {
        String key = filename
                .replaceAll("\\.[^.]+$", "")  // 확장자 제거
                .replaceAll("_\\d+$", "");     // _100, _50 등 크기 접미사 제거
        return FILENAME_TYPE_MAP.getOrDefault(key, MACHINE);
    }
}
