package skku.gymbarofit.api.security.userdetail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import skku.gymbarofit.core.User;
import skku.gymbarofit.core.repository.UserRepository;

@Slf4j
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User findUser = userRepository.findByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("User not found with email: " + email));

        return org.springframework.security.core.userdetails.User.builder()
                .username(findUser.getEmail())
                .password(findUser.getPassword())
                .roles(findUser.getRole())
                .build();
    }
}
