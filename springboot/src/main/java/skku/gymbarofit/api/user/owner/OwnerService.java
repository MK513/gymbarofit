package skku.gymbarofit.api.user.owner;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.api.security.dto.JwtTokenDto;
import skku.gymbarofit.api.security.service.AuthService;
import skku.gymbarofit.api.security.token.OwnerUsernamePasswordAuthenticationToken;
import skku.gymbarofit.api.security.userdetail.CustomUserDetails;
import skku.gymbarofit.api.user.dto.OwnerLoginResponseDto;
import skku.gymbarofit.api.user.owner.dto.EquipmentCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.EquipmentUpdateRequestDto;
import skku.gymbarofit.api.user.owner.dto.GymCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.GymUpdateRequestDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneSummaryDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneUpdateRequestDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymEquipmentDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymStatsDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymSummaryDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.GymOperatingHour;
import skku.gymbarofit.core.gym.enums.GymStatus;
import skku.gymbarofit.core.gym.repository.GymOperatingHourRepository;
import skku.gymbarofit.core.gym.repository.GymRepository;
import skku.gymbarofit.core.gym.service.GymInternalService;
import skku.gymbarofit.core.item.equipment.Equipment;
import skku.gymbarofit.core.item.equipment.repository.EquipmentRepository;
import skku.gymbarofit.core.item.enums.SizeStatus;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.equipment.exception.EquipmentErrorCode;
import skku.gymbarofit.core.item.equipment.exception.EquipmentException;
import skku.gymbarofit.core.item.locker.exception.LockerErrorCode;
import skku.gymbarofit.core.item.locker.exception.LockerException;
import skku.gymbarofit.core.item.locker.repository.LockerRepository;
import skku.gymbarofit.core.item.locker.repository.LockerZoneRepository;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.usage.equipment.repository.EquipmentUsageRepository;
import skku.gymbarofit.core.log.repository.AccessLogRepository;
import skku.gymbarofit.core.usage.locker.LockerUsage;
import skku.gymbarofit.core.usage.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.usage.locker.repository.LockerUsageRepository;
import skku.gymbarofit.core.user.dto.LoginRequestDto;
import skku.gymbarofit.core.user.owner.Owner;
import skku.gymbarofit.core.user.owner.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.user.owner.dto.OwnerRegisterRequestDto;
import skku.gymbarofit.core.user.owner.service.OwnerInternalService;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Transactional
@Service
@RequiredArgsConstructor
public class OwnerService {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final OwnerInternalService ownerInternalService;
    private final AuthService authService;
    private final GymRepository gymRepository;
    private final GymOperatingHourRepository gymOperatingHourRepository;
    private final GymInternalService gymInternalService;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentUsageRepository equipmentUsageRepository;
    private final LockerRepository lockerRepository;
    private final LockerZoneRepository lockerZoneRepository;
    private final LockerUsageRepository lockerUsageRepository;
    private final AccessLogRepository accessLogRepository;

    public OwnerDetailResponseDto register(OwnerRegisterRequestDto requestDto) {
        String encodedPassword = bCryptPasswordEncoder.encode(requestDto.getPassword());
        Owner owner = ownerInternalService.save(requestDto, encodedPassword);
        return OwnerDetailResponseDto.of(owner);
    }

    public OwnerLoginResponseDto login(LoginRequestDto dto) {
        CustomUserDetails userDetails = authService.authenticateUser(
                new OwnerUsernamePasswordAuthenticationToken(dto.getEmail(), dto.getPassword())
        );
        JwtTokenDto jwtToken = authService.createJwtToken(userDetails);
        String rawRefreshToken = authService.issueRefreshToken(userDetails);
        Owner owner = ownerInternalService.findByEmail(dto.getEmail());
        return new OwnerLoginResponseDto(jwtToken, owner, rawRefreshToken);
    }

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
                    if (gym.getMapData() != null) {
                        try {
                            ObjectMapper mapper = new ObjectMapper();
                            JsonNode node = mapper.readTree(gym.getMapData());
                            // completedStep: 2 → 맵 배치 단계, 3 → 락커 등록 단계
                            currentStep = node.path("completedStep").asInt(3);
                        } catch (Exception e) {
                            currentStep = 3;
                        }
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

    public void saveGymMap(Long ownerId, Long gymId, String mapJson) {
        Gym gym = gymInternalService.findById(gymId);
        gym.saveMap(mapJson);
    }

    @Transactional(readOnly = true)
    public String getGymMap(Long ownerId, Long gymId) {
        Gym gym = gymInternalService.findById(gymId);
        return gym.getMapData();
    }

    @Transactional(readOnly = true)
    public List<OwnerGymEquipmentDto> getGymEquipments(Long ownerId, Long gymId) {
        gymInternalService.findById(gymId);
        return equipmentRepository.findByGym_id(gymId).stream()
                .map(OwnerGymEquipmentDto::from)
                .toList();
    }

    public List<Long> addEquipments(Long ownerId, Long gymId, EquipmentCreateRequestDto dto) {
        Gym gym = gymInternalService.findById(gymId);
        List<Equipment> list = IntStream.range(0, dto.count())
                .mapToObj(i -> Equipment.create(gym, dto.name(), dto.type(), dto.imageUrl(), dto.gridX(), dto.gridY()))
                .toList();
        equipmentRepository.saveAll(list);
        return list.stream().map(Equipment::getId).toList();
    }

    public OwnerGymEquipmentDto updateEquipment(Long ownerId, Long gymId, Long equipmentId, EquipmentUpdateRequestDto dto) {
        gymInternalService.findById(gymId);
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_NOT_FOUND));
        equipment.update(dto.name(), dto.type(), dto.imageUrl());
        return OwnerGymEquipmentDto.from(equipment);
    }

    public void deleteEquipment(Long ownerId, Long gymId, Long equipmentId) {
        gymInternalService.findById(gymId);
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EquipmentException(EquipmentErrorCode.EQUIPMENT_NOT_FOUND));
        equipmentRepository.delete(equipment);
    }

    public void addLockerZone(Long ownerId, Long gymId, LockerZoneCreateRequestDto dto) {
        Gym gym = gymInternalService.findById(gymId);
        SizeStatus size = SizeStatus.valueOf(dto.size());
        String zoneName = (dto.name() != null && !dto.name().isBlank())
                ? dto.name()
                : switch (size) {
                    case SMALL  -> "소형 보관함";
                    case MEDIUM -> "중형 보관함";
                    case LARGE  -> "대형 보관함";
                };
        LockerZone zone = LockerZone.create(gym, zoneName, size, dto.rowCount(), dto.columnCount());
        lockerZoneRepository.save(zone);
        int total = dto.rowCount() * dto.columnCount();
        List<Locker> lockers = IntStream.rangeClosed(1, total)
                .mapToObj(i -> Locker.create(zone, i))
                .toList();
        lockerRepository.saveAll(lockers);
    }

    @Transactional(readOnly = true)
    public List<LockerZoneSummaryDto> getLockerZones(Long ownerId, Long gymId) {
        gymInternalService.findById(gymId);
        return lockerZoneRepository.findAllByGym_Id(gymId).stream()
                .map(zone -> {
                    int rentedCount = lockerUsageRepository
                            .findAllByLocker_LockerZone_IdAndStatusIn(zone.getId(), List.of(LockerUsageStatus.ACTIVE))
                            .size();
                    return LockerZoneSummaryDto.of(zone, rentedCount);
                })
                .toList();
    }

    public LockerZoneSummaryDto updateLockerZone(Long ownerId, Long gymId, Long zoneId, LockerZoneUpdateRequestDto dto) {
        gymInternalService.findById(gymId);
        LockerZone zone = lockerZoneRepository.findById(zoneId)
                .orElseThrow(() -> new LockerException(LockerErrorCode.ZONE_NOT_FOUND));
        int oldTotal = zone.getTotalCount();
        int newTotal = dto.rowCount() * dto.columnCount();
        zone.update(dto.name(), SizeStatus.valueOf(dto.size()), dto.rowCount(), dto.columnCount());
        if (newTotal > oldTotal) {
            List<Locker> newLockers = IntStream.rangeClosed(oldTotal + 1, newTotal)
                    .mapToObj(i -> Locker.create(zone, i))
                    .toList();
            lockerRepository.saveAll(newLockers);
        } else if (newTotal < oldTotal) {
            List<LockerUsage> activeInExcess = lockerUsageRepository
                    .findAllByLocker_LockerZone_IdAndStatusIn(zoneId, List.of(LockerUsageStatus.ACTIVE))
                    .stream()
                    .filter(u -> u.getLocker().getLockerNumber() > newTotal)
                    .toList();
            if (!activeInExcess.isEmpty()) {
                throw new LockerException(LockerErrorCode.LOCKER_ALREADY_USED);
            }
            List<Locker> excessLockers = lockerRepository.findAllByLockerZoneId(zoneId).stream()
                    .filter(l -> l.getLockerNumber() > newTotal)
                    .toList();
            lockerRepository.deleteAll(excessLockers);
        }
        int rentedCount = lockerUsageRepository
                .findAllByLocker_LockerZone_IdAndStatusIn(zoneId, List.of(LockerUsageStatus.ACTIVE))
                .size();
        return LockerZoneSummaryDto.of(zone, rentedCount);
    }

    public void deleteLockerZone(Long ownerId, Long gymId, Long zoneId) {
        gymInternalService.findById(gymId);
        LockerZone zone = lockerZoneRepository.findById(zoneId)
                .orElseThrow(() -> new LockerException(LockerErrorCode.ZONE_NOT_FOUND));
        boolean hasActiveRentals = !lockerUsageRepository
                .findAllByLocker_LockerZone_IdAndStatusIn(zoneId, List.of(LockerUsageStatus.ACTIVE))
                .isEmpty();
        if (hasActiveRentals) {
            throw new LockerException(LockerErrorCode.LOCKER_ALREADY_USED);
        }
        lockerRepository.deleteAll(lockerRepository.findAllByLockerZoneId(zoneId));
        lockerZoneRepository.delete(zone);
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

        // 기구 타입별 총 대수 집계
        Map<String, Integer> totalByType = equipmentRepository.countGroupByType(gymId).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).intValue()
                ));

        // 기구 타입별 현재 사용 중 집계
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

        // 락커 구역별 사용량 집계
        List<OwnerGymStatsDto.LockerZoneUsageDto> lockerZoneUsage = lockerZoneRepository.findAllByGym_Id(gymId).stream()
                .map(zone -> {
                    int rentedCount = lockerUsageRepository
                            .findAllByLocker_LockerZone_IdAndStatusIn(zone.getId(), List.of(LockerUsageStatus.ACTIVE))
                            .size();
                    return new OwnerGymStatsDto.LockerZoneUsageDto(zone.getName(), rentedCount, zone.getTotalCount());
                })
                .toList();

        // 이번 달 기구 종목별 누적 사용 시간
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
