package skku.gymbarofit.api.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

//    private final UserService userService;
//    private final AuthenticationManager authenticationManager;
//
//    @PostMapping("/signup")
//    public ResponseEntity<?> signup(@RequestBody @Valid SignupDto signupDto) {
//
//        Long userId = userService.join(signupDto);
//
//        ResponseDto<Object> responseDto = new ResponseDto<>(HttpStatus.OK, "signup successes");
//        return ResponseEntity.ok().body(responseDto);
//    }
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody @Valid LoginDto loginDto) {
//
//        String email = loginDto.getEmail().trim();
//        String password = loginDto.getPassword();
//
//        try {
//            Authentication authentication = authenticationManager.authenticate(
//                    new UsernamePasswordAuthenticationToken(email, password)
//            );
//
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
