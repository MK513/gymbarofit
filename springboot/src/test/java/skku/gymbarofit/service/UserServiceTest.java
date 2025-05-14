package skku.gymbarofit.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.UserDto;
import skku.gymbarofit.repository.UserRepository;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class UserServiceTest {

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

    @Test
    public void 회원가입() throws Exception {
        //given
        UserDto userDto = getUserDto();

        User user = User.createUser(userDto);

        //when
        Long savedId = userService.join(user);

        //then
        assertEquals(user, userRepository.findOne(savedId));
    }

    @Test
    public void 중복_회원_예외() throws Exception {
        //given
        UserDto userDto = getUserDto();

        User user1 = User.createUser(userDto);
        User user2 = User.createUser(userDto);

        //when
        userService.join(user1);

        //then
        assertThrows(IllegalStateException.class, ()->userService.join(user2));
    }

    private static UserDto getUserDto() {
        UserDto userDto = new UserDto();
        userDto.setName("kim");
        userDto.setEmail("aaaaa@naver.com");
        userDto.setPw_hash("gh!th");
        return userDto;
    }
}