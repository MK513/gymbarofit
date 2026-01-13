package skku.gymbarofit.core.payment.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import skku.gymbarofit.core.payment.Payment;
import skku.gymbarofit.core.payment.enums.PaymentTargetType;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Payment p where p.id = :id")
    Optional<Payment> findByIdForUpdate(@Param("id") Long id);

    @Query("select p from Payment p where p.targetId = :id and p.targetType = :type")
    List<Payment> findByTarget(@Param("id")Long id, @Param("type") PaymentTargetType paymentTargetType);
}
