package skku.gymbarofit.api.user.owner;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
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

    @Value("${app.jwt.refresh-token.expireTime}")
    private long refreshTokenExpireMillis;

    @Value("${app.jwt.refresh-token.secure-cookie}")
    private boolean secureCookie;

    @PostMapping("/login")
    public ResponseEntity<OwnerLoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto,
            HttpServletResponse response
    ) {
        OwnerLoginResponseDto dto = ownerService.login(loginRequestDto);
        setRefreshTokenCookie(response, dto.getRefreshToken());
        return ResponseEntity.ok(dto);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String rawToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", rawToken)
                .httpOnly(true)
                .secure(secureCookie)
                .path("/auth")
                .maxAge(Duration.ofMillis(refreshTokenExpireMillis))
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
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

    @GetMapping("/gyms/{gymId}/stats")
    public ResponseEntity<OwnerGymStatsDto> getGymStats(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(ownerService.getGymStats(ownerId, gymId));
    }

    @GetMapping("/gyms/{gymId}")
    public ResponseEntity<OwnerGymSummaryDto> getGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(ownerService.getGym(ownerId, gymId));
    }

    @PatchMapping("/gyms/{gymId}")
    public ResponseEntity<OwnerGymSummaryDto> updateGym(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody GymUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(ownerService.updateGym(ownerId, gymId, dto));
    }

    @GetMapping("/gyms/{gymId}/equipments")
    public ResponseEntity<List<OwnerGymEquipmentDto>> getGymEquipments(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(ownerService.getGymEquipments(ownerId, gymId));
    }

    @PostMapping("/gyms/{gymId}/equipments")
    public ResponseEntity<List<Long>> addEquipments(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @RequestBody EquipmentCreateRequestDto dto
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ownerService.addEquipments(ownerId, gymId, dto));
    }

    @PatchMapping("/gyms/{gymId}/equipments/{equipmentId}")
    public ResponseEntity<OwnerGymEquipmentDto> updateEquipment(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @PathVariable Long equipmentId,
            @RequestBody EquipmentUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(ownerService.updateEquipment(ownerId, gymId, equipmentId, dto));
    }

    @DeleteMapping("/gyms/{gymId}/equipments/{equipmentId}")
    public ResponseEntity<Void> deleteEquipment(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @PathVariable Long equipmentId
    ) {
        ownerService.deleteEquipment(ownerId, gymId, equipmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/gyms/{gymId}/locker-zones")
    public ResponseEntity<List<LockerZoneSummaryDto>> getLockerZones(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId
    ) {
        return ResponseEntity.ok(ownerService.getLockerZones(ownerId, gymId));
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

    @PatchMapping("/gyms/{gymId}/locker-zones/{zoneId}")
    public ResponseEntity<LockerZoneSummaryDto> updateLockerZone(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @PathVariable Long zoneId,
            @RequestBody LockerZoneUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(ownerService.updateLockerZone(ownerId, gymId, zoneId, dto));
    }

    @DeleteMapping("/gyms/{gymId}/locker-zones/{zoneId}")
    public ResponseEntity<Void> deleteLockerZone(
            @CurrentUserId Long ownerId,
            @PathVariable Long gymId,
            @PathVariable Long zoneId
    ) {
        ownerService.deleteLockerZone(ownerId, gymId, zoneId);
        return ResponseEntity.noContent().build();
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
