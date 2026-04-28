package skku.gymbarofit.api.equipment.notification.events;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class WaitingAvailableEvent {
    private Long memberId;
    private Long equipmentId;
}
