package skku.gymbarofit.api.config;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Collections;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class CorsConfig {

    public static CorsConfigurationSource corsConfigurationSource () {
        CorsConfiguration configuration = new CorsConfiguration();

        // 허용하는 origin
        ArrayList<String> allowedOriginPatterns = new ArrayList<>();
        allowedOriginPatterns.add("http://localhost:3000");
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
