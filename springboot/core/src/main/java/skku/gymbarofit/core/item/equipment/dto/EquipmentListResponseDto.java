package skku.gymbarofit.core.item.equipment.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // Jackson 역직렬화용 기본 생성자
@AllArgsConstructor(access = AccessLevel.PRIVATE) // 정적 팩토리 메서드용 전체 생성자
public class EquipmentListResponseDto {

    private int totalCount;
    private List<String> equipmentTypes;
    private List<EquipmentResponseDto> equipments;

    public static EquipmentListResponseDto of(int totalCount, List<String> equipmentTypes, List<EquipmentResponseDto> listDto) {
        return new EquipmentListResponseDto(totalCount, equipmentTypes, listDto);
    }
}