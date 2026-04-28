package skku.gymbarofit.core.item;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import skku.gymbarofit.core.item.enums.ItemStatus;

@Embeddable
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ItemInfo {

    private String name;

<<<<<<< HEAD
=======
    // TODO 이후 아이템 고장 상태 등 업데이트 기능
>>>>>>> origin/main
    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    public static ItemInfo create(String name, ItemStatus status) {
        return new ItemInfo(name, status);
    }
}
