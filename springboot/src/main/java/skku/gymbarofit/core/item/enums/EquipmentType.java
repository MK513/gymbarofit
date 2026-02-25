package skku.gymbarofit.core.item.enums;

import java.util.Map;

public enum EquipmentType {

    CARDIO, FREE_WEIGHT, MACHINE, STRETCHING;

    private static final Map<String, EquipmentType> FILENAME_TYPE_MAP = Map.of(
            "랫풀다운",  MACHINE,
            "러닝머신",  CARDIO,
            "레그프레스", MACHINE,
            "벤치프레스", FREE_WEIGHT,
            "사이클",    CARDIO,
            "스미스머신", MACHINE
    );

    /**
     * 파일명(확장자·크기 접미사 포함 가능)으로부터 유형을 반환한다.
     * 매핑에 없는 경우 기본값 MACHINE을 반환한다.
     */
    public static EquipmentType fromFilename(String filename) {
        String key = filename
                .replaceAll("\\.[^.]+$", "")  // 확장자 제거
                .replaceAll("_\\d+$", "");     // _100, _50 등 크기 접미사 제거
        return FILENAME_TYPE_MAP.getOrDefault(key, MACHINE);
    }
}
