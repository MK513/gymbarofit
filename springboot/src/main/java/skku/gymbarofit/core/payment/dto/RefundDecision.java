package skku.gymbarofit.core.payment.dto;

import skku.gymbarofit.core.payment.Payment;

import java.util.List;

public record RefundDecision(boolean shouldRefund, List<Long> paymentIds) {

    public static RefundDecision skip() {
        return new RefundDecision(false, null);
    }

    public static RefundDecision doRefund(List<Payment> payments) {
        return new RefundDecision(true, payments.stream().map(Payment::getId).toList());
    }
}

