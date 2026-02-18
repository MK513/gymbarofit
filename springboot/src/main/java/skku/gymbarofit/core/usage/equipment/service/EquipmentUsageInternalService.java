package skku.gymbarofit.core.usage.equipment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;
import skku.gymbarofit.core.usage.equipment.EquipmentUsage;
import skku.gymbarofit.core.usage.equipment.dto.WorkoutHistoryResponseDto;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.usage.equipment.repository.EquipmentUsageRepository;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class EquipmentUsageInternalService {

    private final EquipmentUsageRepository equipmentUsageRepository;

    private final Clock clock;

    private static final List<EquipmentUsageStatus> WAITING_OR_CALLED =
            List.of(EquipmentUsageStatus.WAITING, EquipmentUsageStatus.CALLED);

    private static final List<EquipmentUsageStatus> INUSE_OR_WAITING_OR_CALLED =
            List.of(EquipmentUsageStatus.IN_USE, EquipmentUsageStatus.WAITING, EquipmentUsageStatus.CALLED);

    @Transactional(readOnly = true)
    public List<EquipmentUsage> findActiveByGymId(Long gymId) {
        return equipmentUsageRepository.findByGymIdAndStatusIn(gymId, INUSE_OR_WAITING_OR_CALLED);
    }

    public EquipmentUsage save(EquipmentUsage equipmentUsage) {
        return equipmentUsageRepository.save(equipmentUsage);
    }

    @Transactional(readOnly = true)
    public Optional<EquipmentUsage> findInUseByMemberId(Long memberId) {
        return equipmentUsageRepository.findByMemberIdAndStatusIn(memberId, EquipmentUsageStatus.IN_USE);
    }

    @Transactional(readOnly = true)
    public Optional<EquipmentUsage> findWaitingByMemberId(Long memberId) {
        return equipmentUsageRepository.findByMemberIdAndStatusIn(memberId, EquipmentUsageStatus.WAITING);
    }

    @Transactional(readOnly = true)
    public int countWaitingForMember(Long equipmentId, Long memberId) {
        return equipmentUsageRepository.countWaitingForMember(equipmentId, memberId);
    }

    public EquipmentUsage findForUpdate(Long usageId) {
        return equipmentUsageRepository.findForUpdate(usageId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_USAGE_NOT_FOUND));
    }

    public EquipmentUsage findFirstWaitingForUpdate(Long equipmentId) {
        return equipmentUsageRepository.findFirstWaitingForUpdate(equipmentId, PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);
    }

    public EquipmentUsage findById(Long usageId) {
        return equipmentUsageRepository.findById(usageId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_USAGE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public int countWaitingOfEquipment(Long equipmentId) {
        return equipmentUsageRepository.countWaitingOfEquipment(equipmentId);
    }

    @Transactional(readOnly = true)
    public boolean existUsing(Long equipmentId) {
        return equipmentUsageRepository.existsByEquipmentIdAndStatus(equipmentId, EquipmentUsageStatus.IN_USE);
    }

    public void delete(EquipmentUsage usage) {
        equipmentUsageRepository.delete(usage);
    }

    public int getTodayTotalUsageMinutes(Long memberId) {
        return equipmentUsageRepository.sumUsageMinutesForToday(
                memberId,
                startOfToday(),
                startOfTomorrow()
        );
    }

    public float getTodayTotalCalories(Long memberId) {
        return equipmentUsageRepository.sumCaloriesForToday(
                memberId,
                startOfToday(),
                startOfTomorrow()
        );
    }

    public List<EquipmentUsage> getRecentThreeActivities(Long memberId) {
        return equipmentUsageRepository.findTop3ByMemberIdAndStatusOrderByEndAtDesc(
                memberId,
                EquipmentUsageStatus.COMPLETED
        );
    }

    @Transactional(readOnly = true)
    public WorkoutHistoryResponseDto getMonthlyHistory(Long memberId, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime start = ym.atDay(1).atStartOfDay();
        LocalDateTime end = ym.plusMonths(1).atDay(1).atStartOfDay();
        List<EquipmentUsage> usages =
                equipmentUsageRepository.findCompletedByMemberIdAndMonth(memberId, start, end);
        return WorkoutHistoryResponseDto.from(usages);
    }

    private LocalDateTime startOfToday() {
        return LocalDate.now(clock).atStartOfDay();
    }

    private LocalDateTime startOfTomorrow() {
        return LocalDate.now(clock).plusDays(1).atStartOfDay();
    }
}
