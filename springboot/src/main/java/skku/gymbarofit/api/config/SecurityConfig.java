package skku.gymbarofit.api.config;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfiguration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import skku.gymbarofit.api.security.filter.JwtTokenFilter;
import skku.gymbarofit.api.security.provider.JwtTokenProvider;
import skku.gymbarofit.api.security.userdetail.CustomUserDetailService;
import skku.gymbarofit.core.repository.UserRepository;

import java.util.ArrayList;
import java.util.Collections;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableJpaRepositories("skku.gymbarofit")
public class SecurityConfig extends WebSecurityConfiguration {

    @Value("${jwt.secretKey}")
    private String secretKey;

    private final UserRepository userRepository;
    private final JwtTokenFilter jwtTokenFilter;

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, rsp, e) -> {
                            rsp.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            rsp.setContentType("application/json;charset=UTF-8");
                            rsp.getWriter().write("{\"error\":\"UNAUTHORIZED\"}");
                        })
                        .accessDeniedHandler((req, rsp, e) -> {
                            rsp.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            rsp.setContentType("application/json;charset=UTF-8");
                            rsp.getWriter().write("{\"error\":\"FORBIDDEN\"}");
                        })
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(header ->
                        header.addHeaderWriter(new StaticHeadersWriter(
                        "X-Content-Security-Policy",
                        "script-src 'self'"
                )))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/members/**").hasRole("MEMBER")
                        .requestMatchers("/owners/**").hasRole("OWNER")
                        .requestMatchers("/members/register", "/owners/register", "/members/login", "/owners/login").permitAll()
                        .requestMatchers(
                               "/", "/index.html", "/assets/**", "/*.ico",
                               "/**/*.css", "/**/*.js", "/**/*.png", "/**/*.svg"
                        ).permitAll()
//                        .anyRequest().permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    public AuthenticationManager authenticationManager() {
        return super.authenticationManager();
    }

    @Bean
    public CustomUserDetailService customUserDetailService() {
        return new CustomUserDetailService(userRepository);
    }

    @Bean
    public JwtTokenProvider jwtTokenProvider() {
        return new JwtTokenProvider();
    }

    public CorsConfigurationSource corsConfigurationSource () {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용하는 origin
        ArrayList<String> allowedOriginPatterns = new ArrayList<>();
        allowedOriginPatterns.add("http://localhost:5173");
        configuration.setAllowedOrigins(allowedOriginPatterns);

        // 허용하는 HTTP method
        ArrayList<String> allowedHttpMethods = new ArrayList<>();
        allowedHttpMethods.add("GET");
        allowedHttpMethods.add("POST");
        allowedHttpMethods.add("PUT");
        allowedHttpMethods.add("DELETE");
        allowedHttpMethods.add("OPTIONS");
        configuration.setAllowedMethods(allowedHttpMethods);

        // 모든 헤더 허용
        configuration.setAllowedHeaders(Collections.singletonList("*"));

        // 인증, 인가 위한 credential 사용 허가
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}
