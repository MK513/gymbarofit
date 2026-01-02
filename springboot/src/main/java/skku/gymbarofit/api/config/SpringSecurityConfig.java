package skku.gymbarofit.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import skku.gymbarofit.api.security.filter.CustomAuthenticationFilter;
import skku.gymbarofit.api.security.filter.JwtTokenFilter;
import skku.gymbarofit.api.security.provider.CustomAuthenticationProvider;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;
import skku.gymbarofit.api.security.userdetail.CustomUserDetailService;
import skku.gymbarofit.core.repository.UserRepository;

@Configuration
@EnableWebSecurity
@EnableJpaRepositories("skku.gymbarofit.repository")
public class SpringSecurityConfig {

    @Value("${jwt.secretKey}")
    private String secretKey;

    private final UserRepository userRepository;

    public SpringSecurityConfig(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors
                        .configurationSource(CorsConfig.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)       // JWT 사용하므로 formLogin, csrf, sessionManagement 비활성화
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/member/**").hasRole("MEMBER")
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/auth/signup").permitAll()
                        .requestMatchers("/auth/**").authenticated()
                        .anyRequest().permitAll()
                )
                .addFilter(customAuthenticationFilter())
                .addFilterBefore(jwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CustomAuthenticationFilter customAuthenticationFilter() {
        CustomAuthenticationFilter customAuthenticationFilter = new CustomAuthenticationFilter(authenticationManager(), jwtTokenProvider(), userRepository);
        customAuthenticationFilter.setFilterProcessesUrl("/auth/login");
        customAuthenticationFilter.afterPropertiesSet();
        return customAuthenticationFilter;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(customAuthenticationProvider());
    }

    @Bean
    public CustomAuthenticationProvider customAuthenticationProvider() {
        return new CustomAuthenticationProvider(passwordEncoder(), customUserDetailService());
    }

    @Bean
    public CustomUserDetailService customUserDetailService() {
        return new CustomUserDetailService(userRepository);
    }

    @Bean
    public JwtTokenFilter jwtTokenFilter() {
        return new JwtTokenFilter(customUserDetailService(), jwtTokenProvider());
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider();
    }
}
