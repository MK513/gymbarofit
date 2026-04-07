package skku.gymbarofit.core.item.locker.dto;

import skku.gymbarofit.core.usage.locker.enums.LockerPlan;
import skku.gymbarofit.core.payment.enums.PaymentMethod;

public record LockerExtendRequestDto (
        LockerPlan plan,
        PaymentMethod paymentMethod
) {
}
