package skku.gymbarofit.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.repository.UserRepository;

@SpringBootTest
@Transactional
class MemberServiceTest {

    @Autowired
    UserService userService;

    @Autowired
    UserRepository userRepository;

//    @Test
//    public void 회원가입() throws Exception {
//        //given
//        MemberSignupDto userSignupForm = getUser();
//
//        Member member = Member.createUser(userSignupForm);
//
//        //when
//        Long savedId = memberService.join(member);
//
//        //then
//        assertEquals(member, memberRepository.findOne(savedId));
//    }
//
//    @Test
//    public void 중복_회원_예외() throws Exception {
//        //given
//        MemberSignupDto userSignupForm = getUser();
//
//        Member member1 = Member.createUser(userSignupForm);
//        Member member2 = Member.createUser(userSignupForm);
//
//        //when
//        memberService.join(member1);
//
//        //then
//        assertThrows(IllegalStateException.class, ()-> memberService.join(member2));
//    }
//
//    private static MemberSignupDto getUser() {
//        MemberSignupDto userSignupForm = new MemberSignupDto();
//        userSignupForm.setName("kim");
//        userSignupForm.setEmail("aaaaa@naver.com");
//        userSignupForm.setPassword("gh!th");
//        return userSignupForm;
//    }
}