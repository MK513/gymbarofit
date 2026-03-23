package skku.gymbarofit.api.equipment.notification.listeners;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import skku.gymbarofit.api.equipment.notification.events.EquipmentChangedEvent;
import skku.gymbarofit.api.equipment.notification.events.WaitingAvailableEvent;
import skku.gymbarofit.api.notification.NotificationFacade;

@Slf4j
@Component
@RequiredArgsConstructor
public class EquipmentNotificationListener {

    private final NotificationFacade notificationFacade;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onEquipmentChanged(EquipmentChangedEvent event) {
        notificationFacade.notifyEquipmentStatus(event.equipmentId());
    }


    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onWaitingAvailable(WaitingAvailableEvent event) {
        notificationFacade.notifyWaitingAvailable(event.memberId(), event.equipmentId());
    }
}
