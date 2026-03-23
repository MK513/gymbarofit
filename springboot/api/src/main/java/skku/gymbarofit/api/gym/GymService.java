package skku.gymbarofit.api.gym;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.user.owner.dto.GymCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.GymMapResponseDto;
import skku.gymbarofit.api.user.owner.dto.GymUpdateRequestDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymEquipmentDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymStatsDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymSummaryDto;
import skku.gymbarofit.api.user.owner.dto.SaveMapRequestDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.GymOperatingHour;
import skku.gymbarofit.core.gym.dto.GymDetailResponseDto;
import skku.gymbarofit.core.gym.enums.GymStatus;
import skku.gymbarofit.core.gym.repository.GymOperatingHourRepository;
import skku.gymbarofit.core.gym.repository.GymRepository;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.item.equipment.repository.EquipmentRepository;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.repository.LockerZoneRepository;
import skku.gymbarofit.core.log.repository.AccessLogRepository;
import skku.gymbarofit.core.membership.Membership;
import skku.gymbarofit.core.membership.enums.MembershipStatus;
import skku.gymbarofit.core.membership.exceptions.MembershipErrorCode;
import skku.gymbarofit.core.membership.exceptions.MembershipException;
import skku.gymbarofit.core.membership.service.MembershipInternalService;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.usage.equipment.repository.EquipmentUsageRepository;
import skku.gymbarofit.core.usage.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.usage.locker.repository.LockerUsageRepository;
import skku.gymbarofit.core.user.member.Member;
import skku.gymbarofit.core.user.member.service.MemberInternalService;
import skku.gymbarofit.core.user.owner.Owner;
import skku.gymbarofit.core.user.owner.service.OwnerInternalService;

import java.util.Comparator;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Transactional
@Service
@RequiredArgsConstructor
public class GymService {

    private final GymInternalService gymInternalService;
    private final MembershipInternalService membershipInternalService;
    private final MemberInternalService memberInternalService;
    private final OwnerInternalService ownerInternalService;
    private final GymRepository gymRepository;
    private final GymOperatingHourRepository gymOperatingHourRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentUsageRepository equipmentUsageRepository;
    private final LockerZoneRepository lockerZoneRepository;
    private final LockerUsageRepository lockerUsageRepository;
    private final AccessLogRepository accessLogRepository;

    // ─── 회원용 ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<GymDetailResponseDto> searchByKeyword(String keyword, Pageable pageable) {
        String kw = keyword == null ? "" : keyword.trim();
        if (kw.isEmpty()) return Page.empty(pageable);
        return gymInternalService.findByKeyword(kw, pageable).map(GymDetailResponseDto::from);
    }

    public GymDetailResponseDto register(Long memberId, Long gymId) {
        Member member = memberInternalService.findById(memberId);
        Gym gym = gymInternalService.findById(gymId);

        if (membershipInternalService.existsByMemberIdAndGymId(memberId, gymId)) {
            throw new MembershipException(MembershipErrorCode.MEMBERSHIP_ALREADY_EXISTS);
        }

        Membership membership = Membership.builder()
                .gym(gym)
                .member(member)
                .status(MembershipStatus.ACTIVE)
                .build();

        membershipInternalService.register(membership);
        return GymDetailResponseDto.from(membership.getGym());
    }

    // ─── 오너용 Gym 관리 ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OwnerGymSummaryDto> getMyGyms(Long ownerId) {
        return gymRepository.findByOwner_Id(ownerId).stream()
                .filter(gym -> gym.getStatus() != GymStatus.DRAFT)
                .map(this::buildSummary)
                .toList();
    }

    public OwnerGymSummaryDto createGym(Long ownerId, GymCreateRequestDto dto) {
        Owner owner = ownerInternalService.findById(ownerId);
        GymStatus status = dto.status() != null ? GymStatus.valueOf(dto.status()) : GymStatus.ACTIVE;
        Gym gym = Gym.create(dto.name(), dto.postalCode(), dto.address(), dto.maxCapacity(), owner, status);
        gymRepository.save(gym);

        if (dto.operatingHours() != null) {
            List<GymOperatingHour> hours = dto.operatingHours().stream()
                    .map(h -> GymOperatingHour.create(
                            gym,
                            DayOfWeek.valueOf(h.dayOfWeek()),
                            h.closed() || h.openAt() == null ? null : LocalTime.parse(h.openAt()),
                            h.closed() || h.closeAt() == null ? null : LocalTime.parse(h.closeAt()),
                            h.closed()
                    ))
                    .toList();
            gymOperatingHourRepository.saveAll(hours);
        }

        return OwnerGymSummaryDto.of(gym, 0, 0, 0, 0);
    }

    @Transactional(readOnly = true)
    public Optional<OwnerGymSummaryDto> getDraftGym(Long ownerId) {
        return gymRepository.findByOwner_IdAndStatus(ownerId, GymStatus.DRAFT)
                .map(gym -> {
                    int equipmentCount = equipmentRepository.countByGym_Id(gym.getId());
                    int currentStep;
                    if (gym.getMapWidth() != null) {
                        currentStep = 3;
                    } else if (equipmentCount > 0) {
                        currentStep = 2;
                    } else {
                        currentStep = 1;
                    }
                    return OwnerGymSummaryDto.of(gym, equipmentCount, 0, 0, 0, currentStep);
                });
    }

    @Transactional(readOnly = true)
    public OwnerGymSummaryDto getGym(Long ownerId, Long gymId) {
        Gym gym = gymInternalService.findById(gymId);
        return buildSummary(gym);
    }

    public OwnerGymSummaryDto updateGym(Long ownerId, Long gymId, GymUpdateRequestDto dto) {
        Gym gym = gymInternalService.findById(gymId);
        gym.update(dto.name(), dto.postalCode(), dto.address(), dto.maxCapacity());
        if (dto.operatingHours() != null) {
            gym.getOperatingHours().clear();
            dto.operatingHours().forEach(h ->
                gym.getOperatingHours().add(
                    GymOperatingHour.create(
                        gym,
                        DayOfWeek.valueOf(h.dayOfWeek()),
                        h.closed() || h.openAt() == null ? null : LocalTime.parse(h.openAt()),
                        h.closed() || h.closeAt() == null ? null : LocalTime.parse(h.closeAt()),
                        h.closed()
                    )
                )
            );
        }
        return buildSummary(gym);
    }

    public void cancelDraftGym(Long ownerId, Long gymId) {
        Gym gym = gymInternalService.findById(gymId);
        gym.cancel();
    }

    public void finalizeGym(Long ownerId, Long gymId) {
        Gym gym = gymInternalService.findById(gymId);
        gym.activate();
    }

    public void saveGymMap(Long ownerId, Long gymId, SaveMapRequestDto dto) {
        Gym gym = gymInternalService.findById(gymId);
        gym.updateMapSize(dto.mapWidth(), dto.mapHeight());
        if (dto.equipments() != null) {
            for (SaveMapRequestDto.EquipmentPlacementDto p : dto.equipments()) {
                equipmentRepository.findById(p.id())
                        .ifPresent(e -> e.updatePosition(p.gridX(), p.gridY(), p.spanW(), p.spanH()));
            }
        }
    }

    @Transactional(readOnly = true)
    public GymMapResponseDto getGymMap(Long ownerId, Long gymId) {
        Gym gym = gymInternalService.findById(gymId);
        if (gym.getMapWidth() == null) return null;
        List<GymMapResponseDto.EquipmentPlacementDto> placements = equipmentRepository.findByGym_id(gymId).stream()
                .filter(e -> e.getGridX() != null)
                .map(e -> new GymMapResponseDto.EquipmentPlacementDto(e.getId(), e.getGridX(), e.getGridY(), e.getSpanW(), e.getSpanH()))
                .toList();
        return new GymMapResponseDto(gym.getMapWidth(), gym.getMapHeight(), placements);
    }

    @Transactional(readOnly = true)
    public OwnerGymStatsDto getGymStats(Long ownerId, Long gymId) {
        gymInternalService.findById(gymId);

        LocalDateTime now = LocalDateTime.now();
        int y = now.getYear(), m = now.getMonthValue();

        List<OwnerGymStatsDto.HourlyVisitDto> visits =
                accessLogRepository.countByGymGroupByHour(gymId).stream()
                        .map(row -> new OwnerGymStatsDto.HourlyVisitDto(
                                ((Number) row[0]).intValue(), ((Number) row[1]).intValue()))
                        .toList();

        Map<String, Integer> totalByType = equipmentRepository.countGroupByType(gymId).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).intValue()
                ));

        Map<String, Integer> inUseByType = equipmentUsageRepository.countInUseGroupByEquipmentType(gymId).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).intValue()
                ));

        List<OwnerGymStatsDto.EquipmentUsageStatsDto> equipmentUsage = totalByType.entrySet().stream()
                .map(entry -> new OwnerGymStatsDto.EquipmentUsageStatsDto(
                        entry.getKey(),
                        inUseByType.getOrDefault(entry.getKey(), 0),
                        entry.getValue()
                ))
                .sorted(Comparator.comparingInt(OwnerGymStatsDto.EquipmentUsageStatsDto::totalCount).reversed())
                .toList();

        List<OwnerGymStatsDto.LockerZoneUsageDto> lockerZoneUsage = lockerZoneRepository.findAllByGym_Id(gymId).stream()
                .map(zone -> {
                    int rentedCount = lockerUsageRepository
                            .findAllByLocker_LockerZone_IdAndStatusIn(zone.getId(), List.of(LockerUsageStatus.ACTIVE))
                            .size();
                    return new OwnerGymStatsDto.LockerZoneUsageDto(zone.getName(), rentedCount, zone.getTotalCount());
                })
                .toList();

        LocalDateTime startOfMonth = LocalDateTime.of(y, m, 1, 0, 0);
        LocalDateTime startOfNextMonth = startOfMonth.plusMonths(1);
        List<OwnerGymStatsDto.MonthlyEquipmentUsageDto> monthlyEquipmentUsage =
                equipmentUsageRepository.sumDurationGroupByEquipmentName(gymId, startOfMonth, startOfNextMonth).stream()
                        .map(row -> new OwnerGymStatsDto.MonthlyEquipmentUsageDto(
                                (String) row[0], ((Number) row[1]).intValue()))
                        .sorted(Comparator.comparingInt(OwnerGymStatsDto.MonthlyEquipmentUsageDto::totalMinutes).reversed())
                        .toList();

        return new OwnerGymStatsDto(visits, equipmentUsage, lockerZoneUsage, monthlyEquipmentUsage);
    }

    // ─── 오너용 Equipment 관리 ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<OwnerGymEquipmentDto> getGymEquipments(Long ownerId, Long gymId) {
        gymInternalService.findById(gymId);
        return equipmentRepository.findByGym_id(gymId).stream()
                .map(OwnerGymEquipmentDto::from)
                .toList();
    }

    // ─── private helpers ────────────────────────────────────────────────────────

    private OwnerGymSummaryDto buildSummary(Gym gym) {
        Long gymId = gym.getId();
        int totalEquipments = equipmentRepository.countByGym_Id(gymId);
        int activeEquipments = (int) equipmentUsageRepository
                .countByGymIdAndStatus(gymId, EquipmentUsageStatus.IN_USE);
        int totalLockers = lockerZoneRepository.findAllByGym_Id(gymId).stream()
                .mapToInt(LockerZone::getTotalCount).sum();
        int rentedLockers = (int) lockerUsageRepository
                .countByGymIdAndStatus(gymId, LockerUsageStatus.ACTIVE);
        return OwnerGymSummaryDto.of(gym, totalEquipments, activeEquipments, totalLockers, rentedLockers);
    }
}
