package skku.gymbarofit.api.global.aop;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.equipment.notification.events.EquipmentChangedEvent;
import skku.gymbarofit.api.global.annotation.EquipmentId;
import skku.gymbarofit.api.global.annotation.UsageId;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;

import java.lang.reflect.Parameter;

@Aspect
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationAspect {

    private final ApplicationEventPublisher applicationEventPublisher;
    private final EquipmentUsageInternalService equipmentUsageInternalService;

    @AfterReturning("@annotation(skku.gymbarofit.api.global.annotation.NotifyEquipmentChange)")
    public void sendNotification(JoinPoint joinPoint) {

        Long equipmentId = resolveEquipmentId(joinPoint);

        if (equipmentId == null) return;

        //log.info("sendNotification updated equipmentId: {}", equipmentId);
        applicationEventPublisher.publishEvent(new EquipmentChangedEvent(equipmentId));
    }

    private Long resolveEquipmentId(JoinPoint joinPoint) {
        MethodSignature sig = (MethodSignature) joinPoint.getSignature();
        Parameter[] params = sig.getMethod().getParameters();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < params.length; i++) {
            if (params[i].isAnnotationPresent(EquipmentId.class) && args[i] instanceof Long l) {
                return l;
            }
            if (params[i].isAnnotationPresent(UsageId.class) && args[i] instanceof Long l) {
                EquipmentUsage usage = equipmentUsageInternalService.findById(l);
                return usage.getEquipment().getId();
            }
        }
        return null;
    }

}
