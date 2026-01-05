package skku.gymbarofit.api.user.member;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.core.dto.LoginRequestDto;
import skku.gymbarofit.core.dto.LoginResponseDto;
import skku.gymbarofit.core.dto.MemberDetailResponseDto;
import skku.gymbarofit.core.dto.MemberRegisterRequestDto;

@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberApiController {

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @RequestBody LoginRequestDto loginRequestDto
    ) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    public ResponseEntity<MemberDetailResponseDto> register(
            @RequestBody MemberRegisterRequestDto registerRequestDto
    ) {

        MemberDetailResponseDto responseDto = new MemberDetailResponseDto(1L, registerRequestDto.getEmail(), registerRequestDto.getUsername());

        return ResponseEntity.ok(responseDto);
    }

}
