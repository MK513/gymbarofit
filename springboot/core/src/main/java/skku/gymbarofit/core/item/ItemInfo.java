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

    @Enumerated(EnumType.STRING)
    private ItemStatus status;

    public static ItemInfo create(String name, ItemStatus status) {
        return new ItemInfo(name, status);
    }
}
