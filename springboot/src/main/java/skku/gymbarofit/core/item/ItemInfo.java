package skku.gymbarofit.core.item;

import jakarta.persistence.*;
import lombok.Getter;
import skku.gymbarofit.core.item.enums.ItemStatus;

@Embeddable
@Getter
public class ItemInfo {

    private String name;

    // TODO 이후 아이템 고장 상태 등 업데이트 기능
    @Enumerated(EnumType.STRING)
    private ItemStatus status;

}
