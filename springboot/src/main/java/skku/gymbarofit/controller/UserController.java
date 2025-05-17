package skku.gymbarofit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.ResponseDto;
import skku.gymbarofit.dto.LoginDto;
import skku.gymbarofit.dto.SignupDto;
import skku.gymbarofit.service.UserService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid SignupDto memberSignupForm, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().toString());
        }

        userService.join(memberSignupForm);

        return ResponseEntity.ok().body(null);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginDto loginDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().toString());
        }

        try {
            User user = userService.login(loginDto.getEmail(), loginDto.getPassword());

            return ResponseEntity.ok().body(user);
        } catch (Exception e) {
            ResponseDto<Object> responseDto = ResponseDto.builder()
                    .error("Login failed.")
                    .build();
            return ResponseEntity.badRequest().body(responseDto);
        }
    }
}

// 전체적으로 개선 필요 --> 클린코드!!