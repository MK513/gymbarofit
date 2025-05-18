package skku.gymbarofit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import skku.gymbarofit.dto.SignupDto;
import skku.gymbarofit.service.UserService;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid SignupDto signupDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().toString());
        }

        Long userId = userService.join(signupDto);

        return ResponseEntity.ok().body(userId);
    }

    // login은 filterchain에서 처리
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody @Valid LoginDto loginDto, BindingResult bindingResult) {
//        log.info("controller executed 1");
//        if (bindingResult.hasErrors()) {
//            log.info("controller executed 2");
//
//            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().toString());
//        }
//
//        try {
//            User user = userService.login(loginDto.getEmail(), loginDto.getPassword());
//
//            return ResponseEntity.ok().body(user);
//        } catch (Exception e) {
//            ResponseDto<Object> responseDto = ResponseDto.builder()
//                    .error("Login failed.")
//                    .build();
//            return ResponseEntity.badRequest().body(responseDto);
//        }
//    }
}
