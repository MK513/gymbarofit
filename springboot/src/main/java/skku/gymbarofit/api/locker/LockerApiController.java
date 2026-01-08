package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/lockers")
@RequiredArgsConstructor
@RestController
public class LockerApiController {

    private final LockerService lockerService;

    @GetMapping("/info")
    public ResponseEntity<Object> info() {
        return ResponseEntity.ok().build();
//        return ResponseEntity.ok(lockerService.findAll()).build();
    }
}
