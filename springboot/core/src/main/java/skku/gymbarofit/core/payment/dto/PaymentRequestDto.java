package skku.gymbarofit.core.payment.dto;

import skku.gymbarofit.core.payment.enums.PaymentMethod;

public record PaymentRequestDto(
        Long memberId,
        int amount,
        PaymentMethod paymentMethod
) {}
