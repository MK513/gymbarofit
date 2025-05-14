package skku.gymbarofit.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.UserDto;
import skku.gymbarofit.service.UserService;

@Controller
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public String registerUser(@RequestBody UserDto userDto) {
        User user = User.createUser(userDto);

        Long userId = userService.join(user);

        return null;
    }
}
