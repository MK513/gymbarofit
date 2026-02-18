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
import skku.gymbarofit.api.user.owner.dto.GymCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymSummaryDto;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.repository.GymRepository;
import skku.gymbarofit.core.item.equipment.repository.EquipmentRepository;
import skku.gymbarofit.core.item.locker.LockerZone;
import skku.gymbarofit.core.item.locker.repository.LockerZoneRepository;
import skku.gymbarofit.core.usage.equipment.enums.EquipmentUsageStatus;
import skku.gymbarofit.core.usage.equipment.repository.EquipmentUsageRepository;
import skku.gymbarofit.core.usage.locker.enums.LockerUsageStatus;
import skku.gymbarofit.core.usage.locker.repository.LockerUsageRepository;
import skku.gymbarofit.core.user.dto.LoginRequestDto;
import skku.gymbarofit.core.user.owner.Owner;
import skku.gymbarofit.core.user.owner.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.user.owner.dto.OwnerRegisterRequestDto;
import skku.gymbarofit.core.user.owner.service.OwnerInternalService;

import java.time.LocalTime;
import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class OwnerService {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final OwnerInternalService ownerInternalService;
    private final AuthService authService;
    private final GymRepository gymRepository;
    private final EquipmentRepository equipmentRepository;
    private final EquipmentUsageRepository equipmentUsageRepository;
    private final LockerZoneRepository lockerZoneRepository;
    private final LockerUsageRepository lockerUsageRepository;

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
        Owner owner = ownerInternalService.findByEmail(dto.getEmail());
        return new OwnerLoginResponseDto(jwtToken, owner);
    }

    @Transactional(readOnly = true)
    public List<OwnerGymSummaryDto> getMyGyms(Long ownerId) {
        return gymRepository.findByOwner_Id(ownerId).stream()
                .map(this::buildSummary)
                .toList();
    }

    public OwnerGymSummaryDto createGym(Long ownerId, GymCreateRequestDto dto) {
        Owner owner = ownerInternalService.findById(ownerId);
        Gym gym = Gym.create(
                dto.name(), dto.address(), dto.maxCapacity(),
                LocalTime.parse(dto.openAt()), LocalTime.parse(dto.closeAt()),
                owner
        );
        gymRepository.save(gym);
        return OwnerGymSummaryDto.of(gym, 0, 0, 0, 0);
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
