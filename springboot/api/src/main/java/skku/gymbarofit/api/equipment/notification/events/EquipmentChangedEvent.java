package skku.gymbarofit.api.equipment.notification.events;

<<<<<<< HEAD
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentChangedEvent {
    private Long equipmentId;
=======
public record EquipmentChangedEvent (Long equipmentId) {
>>>>>>> origin/main
}
