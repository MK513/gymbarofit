package skku.gymbarofit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.ResponseDto;
import skku.gymbarofit.dto.UserDto;
import skku.gymbarofit.service.UserService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public String signupUser(@RequestBody UserDto userDto) {
        User user = User.createUser(userDto);

        Long userId = userService.join(user);

        return null;
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signinUser(@RequestBody UserDto userDto) {


        // 토큰 붙여서 고쳐야함!!!!!
        try {
            User user = userService.findByEmail(userDto.getEmail());

            if (user.getPw_hash().equals(userDto.getPw_hash())) {
                return ResponseEntity.ok().body(null);
            }
            return ResponseEntity.ok().body(null);
//        } catch (EmptyResultDataAccessException e) {
        } catch (Exception e) {
            ResponseDto<Object> responseDto = ResponseDto.builder()
                    .error("Login failed.")
                    .build();
            return ResponseEntity.badRequest().body(responseDto);
        }
    }
}
