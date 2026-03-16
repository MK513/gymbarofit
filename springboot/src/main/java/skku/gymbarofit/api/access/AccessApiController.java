package skku.gymbarofit.api.access;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import skku.gymbarofit.api.global.annotation.CurrentUserId;
import skku.gymbarofit.core.log.dto.AccessStatusDto;

@RestController
@RequestMapping("/gyms")
@RequiredArgsConstructor
public class AccessApiController {

    private final AccessService accessService;

    @PostMapping("/{gymId}/checkin")
    public ResponseEntity<AccessStatusDto> checkIn(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {
        AccessStatusDto status = accessService.checkIn(memberId, gymId);
        return ResponseEntity.status(HttpStatus.CREATED).body(status);
    }

    @PostMapping("/{gymId}/checkout")
    public ResponseEntity<AccessStatusDto> checkOut(
            @CurrentUserId Long memberId,
            @PathVariable Long gymId
    ) {
        AccessStatusDto status = accessService.checkOut(memberId, gymId);
        return ResponseEntity.ok(status);
    }
}
