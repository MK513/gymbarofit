package skku.gymbarofit.api.user.owner;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.api.user.dto.OwnerLoginResponseDto;
import skku.gymbarofit.api.user.owner.dto.EquipmentCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.GymCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.LockerZoneCreateRequestDto;
import skku.gymbarofit.api.user.owner.dto.OwnerGymSummaryDto;
import skku.gymbarofit.core.user.dto.LoginRequestDto;
import skku.gymbarofit.core.user.owner.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.user.owner.dto.OwnerRegisterRequestDto;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/owners")
public class OwnerApiController {

    private final OwnerService ownerService;

    @PostMapping("/login")
    public ResponseEntity<OwnerLoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto
    ) {
        return ResponseEntity.ok(ownerService.login(loginRequestDto));
    }

    @PostMapping("/register")
    public ResponseEntity<OwnerDetailResponseDto> register(
            @RequestBody OwnerRegisterRequestDto registerRequestDto
    ) {
        return ResponseEntity.ok(ownerService.register(registerRequestDto));
    }

    @GetMapping("/gyms")
    public ResponseEntity<List<OwnerGymSummaryDto>> getMyGyms(
            @CurrentUserId Long ownerId
    ) {
        return ResponseEntity.ok(ownerService.getMyGyms(ownerId));
    }

    @PostMapping("/gyms")
    public ResponseEntity<OwnerGymSummaryDto> createGym(
            @CurrentUserId Long ownerId,
            @RequestBody GymCreateRequestDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ownerService.createGym(ownerId, dto));
    }

    @PostMapping("/gyms/{gymId}/equipments")
    public ResponseEntity<Void> addEquipments(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody EquipmentCreateRequestDto dto
    ) {
        ownerService.addEquipments(ownerId, gymId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/gyms/{gymId}/locker-zones")
    public ResponseEntity<Void> addLockerZone(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody LockerZoneCreateRequestDto dto
    ) {
        ownerService.addLockerZone(ownerId, gymId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
