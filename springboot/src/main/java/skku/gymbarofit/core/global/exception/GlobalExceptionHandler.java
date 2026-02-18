package skku.gymbarofit.core.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import skku.gymbarofit.core.global.exception.mapper.EquipmentExceptionMapper;
import skku.gymbarofit.core.global.exception.mapper.LockerExceptionMapper;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;

import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

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
        log.warn("BusinessException Occurred [DATA_INTEGRITY}: {}", mappedException.getErrorCode().getMessage());
        return ErrorResponse.toResponseEntity(mappedException.getErrorCode());
    }

    @ExceptionHandler(Exception.class) // ✅ 모든 예외 처리
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

        return new GlobalException(GlobalErrorCode.UNKNOWN_ERROR);
    }
}

