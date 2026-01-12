package skku.gymbarofit.core.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import skku.gymbarofit.core.payment.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
