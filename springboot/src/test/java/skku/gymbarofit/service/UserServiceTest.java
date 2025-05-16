package skku.gymbarofit.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.domain.User;
import skku.gymbarofit.dto.UserSignupDto;
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
        UserSignupDto userSignupForm = getUser();

        User user = User.createUser(userSignupForm);

        //when
        Long savedId = userService.join(user);

        //then
        assertEquals(user, userRepository.findOne(savedId));
    }

    @Test
    public void 중복_회원_예외() throws Exception {
        //given
        UserSignupDto userSignupForm = getUser();

        User user1 = User.createUser(userSignupForm);
        User user2 = User.createUser(userSignupForm);

        //when
        userService.join(user1);

        //then
        assertThrows(IllegalStateException.class, ()->userService.join(user2));
    }

    private static UserSignupDto getUser() {
        UserSignupDto userSignupForm = new UserSignupDto();
        userSignupForm.setName("kim");
        userSignupForm.setEmail("aaaaa@naver.com");
        userSignupForm.setPassword("gh!th");
        return userSignupForm;
    }
}