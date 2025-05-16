package skku.gymbarofit.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.ResponseDto;
import skku.gymbarofit.dto.UserLoginDto;
import skku.gymbarofit.dto.UserSignupDto;
import skku.gymbarofit.service.UserService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    private final BCryptPasswordEncoder encoder;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody @Valid UserSignupDto userSignupForm, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().toString());
        }

        User user = User.createUser(userSignupForm, encoder);
        userService.join(user);

        return ResponseEntity.ok().body(null);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid UserLoginDto userLoginDto, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors().toString());
        }

        try {
            User user = userService.login(userLoginDto.getEmail(), userLoginDto.getPassword(), encoder);

            return ResponseEntity.ok().body(user);
        } catch (Exception e) {
            ResponseDto<Object> responseDto = ResponseDto.builder()
                    .error("Login failed.")
                    .build();
            return ResponseEntity.badRequest().body(responseDto);
        }
    }
}
