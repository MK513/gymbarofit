package skku.gymbarofit.api.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.apache.catalina.connector.ClientAbortException;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;
import org.springframework.web.context.request.async.AsyncRequestTimeoutException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import skku.gymbarofit.api.global.exception.mapper.EquipmentExceptionMapper;
import skku.gymbarofit.api.global.exception.mapper.LockerExceptionMapper;
import skku.gymbarofit.api.global.exception.mapper.MembershipExceptionMapper;
import skku.gymbarofit.api.global.lock.LockAcquisitionException;
import skku.gymbarofit.core.global.exception.BusinessException;
import skku.gymbarofit.core.global.exception.ErrorResponse;
import skku.gymbarofit.core.global.exception.GlobalErrorCode;
import skku.gymbarofit.core.global.exception.GlobalException;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;
import skku.gymbarofit.core.log.exception.AccessException;

import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Get('/') ERROR 로그 안 찍힘
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Void> handleNoResource(NoResourceFoundException e) {
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(EquipmentException.class)
    public ResponseEntity<ErrorResponse> handleEquipmentException(EquipmentException e) {
        if (e.getEquipmentId() != null) {
            log.warn("EquipmentException Occurred: {} (equipmentId={})", e.getErrorCode().getMessage(), e.getEquipmentId());
        } else if (e.getEquipmentUsageId() != null) {
            log.warn("EquipmentException Occurred: {} (equipmentUsageId={})", e.getErrorCode().getMessage(), e.getEquipmentUsageId());
        } else {
            log.warn("EquipmentException Occurred: {}", e.getErrorCode().getMessage());
        }
        return ErrorResponse.toResponseEntity(e.getErrorCode());
    }

    @ExceptionHandler(AccessException.class)
    public ResponseEntity<ErrorResponse> handleAccessException(AccessException e) {
        if (e.getMemberId() != null) {
            log.warn("AccessException Occurred: {} (memberId={})", e.getErrorCode().getMessage(), e.getMemberId());
        } else {
            log.warn("AccessException Occurred: {}", e.getErrorCode().getMessage());
        }
        return ErrorResponse.toResponseEntity(e.getErrorCode());
    }

    @ExceptionHandler(LockAcquisitionException.class)
    public ResponseEntity<?> handleLockAcquisition(LockAcquisitionException e) {
        log.warn("분산락 획득 실패: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "status", 409,
                        "error", "CONFLICT",
                        "message", "현재 처리 중인 요청이 있습니다. 잠시 후 다시 시도해주세요."
                ));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
        log.warn("BusinessException Occurred: {}", e.getErrorCode().getMessage());
        return ErrorResponse.toResponseEntity(e.getErrorCode());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException e
    ) {
        BusinessException mappedException = map(e);
        log.warn("DataIntegrityViolationException Occurred [DATA_INTEGRITY}: {}", mappedException.getErrorCode().getMessage());
        return ErrorResponse.toResponseEntity(mappedException.getErrorCode());
    }

    @ExceptionHandler(AsyncRequestTimeoutException.class)
    public void handleAsyncTimeout(AsyncRequestTimeoutException e) {
        log.debug("SSE connection timed out (expected)");
    }

    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public void handleAsyncNotUsable(AsyncRequestNotUsableException e) {
        log.debug("Async request no longer usable (client disconnected): {}", e.getMessage());
    }

    @ExceptionHandler(ClientAbortException.class)
    public void handleClientAbort(ClientAbortException e) {
        log.debug("Client disconnected (Broken Pipe — expected): {}", e.getMessage());
    }

    @ExceptionHandler(Exception.class) // 모든 예외 처리
    public ResponseEntity<?> handleAll(Exception e) {

        log.error("Unhandled Exception: ", e);

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of(
                "status", 500,
                "error", "INTERNAL_SERVER_ERROR",
                "message", "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요."
            ));
    }

    private String extractConstraintName(Throwable t) {
        while (t != null) {
            if (t instanceof ConstraintViolationException cve) {
                String name = cve.getConstraintName();
                return normalizeConstraintName(name);
            }
            t = t.getCause();
        }
        return null;
    }

    private String normalizeConstraintName(String name) {
        if (name == null) return null;

        String n = name.trim().toLowerCase();

        int dot = n.lastIndexOf('.');
        if (dot >= 0) n = n.substring(dot + 1);

        return n;
    }

    private BusinessException map(DataIntegrityViolationException e) {
        String constraint = extractConstraintName(e);
        if (constraint == null || constraint.isBlank()) return new GlobalException(GlobalErrorCode.UNKNOWN_ERROR);

        log.info("constraintName(normalized): {}", constraint);

        if (constraint.contains("uk_equipment_usage_")) {
            return EquipmentExceptionMapper.map(constraint);
        }
        if (constraint.contains("uk_locker_usage_")) {
            return LockerExceptionMapper.map(constraint);
        }
        if (constraint.contains("uk_membership_")) {
            return MembershipExceptionMapper.map(constraint);
        }

        return new GlobalException(GlobalErrorCode.UNKNOWN_ERROR);
    }
}
