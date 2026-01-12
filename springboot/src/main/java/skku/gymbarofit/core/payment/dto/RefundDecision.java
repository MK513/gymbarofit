package skku.gymbarofit.core.payment.dto;

public record RefundDecision(boolean shouldRefund, Long paymentId) {

    public static RefundDecision skip() {
        return new RefundDecision(false, null);
    }

    public static RefundDecision doRefund(Long paymentId) {
        return new RefundDecision(true, paymentId);
    }
}

