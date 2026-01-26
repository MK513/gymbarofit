package skku.gymbarofit.api.global.aop;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import skku.gymbarofit.api.notification.NotificationFacade;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.service.EquipmentInternalService;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.service.EquipmentUsageInternalService;

@Aspect
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationAspect {

    private final NotificationFacade notificationFacade;
    private final EquipmentInternalService equipmentInternalService;
    private final EquipmentUsageInternalService equipmentUsageInternalService;

    @AfterReturning("@annotation(skku.gymbarofit.api.global.annotation.NotifyEquipmentChange)")
    public void sendNotification(JoinPoint joinPoint) {

        Equipment equipment = resolveEquipment(joinPoint);

        if (equipment != null) {
            log.info("sendNotification {} updated", equipment.getId());
            notificationFacade.notifyEquipmentStatus(equipment);
        }
    }

    private Equipment resolveEquipment(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] paramNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        for (int i = 0; i < paramNames.length; i++) {
            String name = paramNames[i];
            Object value = args[i];

            // 1. 파라미터가 'equipmentId' 인 경우
            if ("equipmentId".equals(name) && value instanceof Long) {
                return equipmentInternalService.findById((Long) value);
            }

            // 2. 파라미터가 'usageId' 인 경우 -> Usage를 조회해서 그 안의 Gym/Equipment를 꺼냄
            if ("usageId".equals(name) && value instanceof Long) {
                EquipmentUsage usage = equipmentUsageInternalService.findById((Long) value);
                return usage.getEquipment();
            }
        }
        return null;
    }

}
