package skku.gymbarofit.api.user.owner;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.core.dto.LoginRequestDto;
import skku.gymbarofit.core.dto.LoginResponseDto;
import skku.gymbarofit.core.dto.OwnerDetailResponseDto;
import skku.gymbarofit.core.dto.OwnerRegisterRequestDto;

@RestController
@RequiredArgsConstructor
@RequestMapping("/owners")
public class OwnerApiController {

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto
    ) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<OwnerDetailResponseDto> register(
            @RequestBody OwnerRegisterRequestDto registerRequestDto
    ) {
        return ResponseEntity.ok().build();
    }
}
