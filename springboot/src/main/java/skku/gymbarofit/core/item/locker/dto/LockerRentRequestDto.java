package skku.gymbarofit.core.item.locker.dto;

import skku.gymbarofit.core.item.locker.enums.LockerPlan;
import skku.gymbarofit.core.payment.enums.PaymentMethod;

public record LockerRentRequestDto (
        Long gymId,
        Long lockerId,
        LockerPlan plan,
        PaymentMethod paymentMethod
) {}
