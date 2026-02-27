package skku.gymbarofit.api.user.owner;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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

// TODO API 위치 쪼개기
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
    public ResponseEntity<List<Long>> addEquipments(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody EquipmentCreateRequestDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ownerService.addEquipments(ownerId, gymId, dto));
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

    @GetMapping("/gyms/draft")
    public ResponseEntity<OwnerGymSummaryDto> getDraftGym(
            @CurrentUserId Long ownerId
    ) {
        return ownerService.getDraftGym(ownerId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PatchMapping("/gyms/{gymId}/cancel")
    public ResponseEntity<Void> cancelDraftGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        ownerService.cancelDraftGym(ownerId, gymId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/gyms/{gymId}/finalize")
    public ResponseEntity<Void> finalizeGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        ownerService.finalizeGym(ownerId, gymId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/gyms/{gymId}/map")
    public ResponseEntity<Void> saveGymMap(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody JsonNode mapData
    ) {
        ownerService.saveGymMap(ownerId, gymId, mapData.toString());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/gyms/{gymId}/map")
    public ResponseEntity<String> getGymMap(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        String mapJson = ownerService.getGymMap(ownerId, gymId);
        if (mapJson == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(mapJson);
    }
}
