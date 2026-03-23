package skku.gymbarofit.api.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtExceptionFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response); // JwtTokenFilter 실행
        } catch (JwtException e) {
            // JwtTokenProvider나 Filter에서 던진 JwtException을 여기서 잡음
            setErrorResponse(HttpStatus.UNAUTHORIZED, response, e);
        } catch (RuntimeException e) {
            // 기타 런타임 에러 처리
            setErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, response, e);
        }
    }

    private void setErrorResponse(HttpStatus status, HttpServletResponse response, Throwable e) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json;charset=UTF-8");

        // GlobalExceptionHandler의 응답 포맷과 맞춰주는 것이 좋음
        Map<String, Object> body = new HashMap<>();
        body.put("status", status.value());
        body.put("error", status.name());
        body.put("message", e.getMessage());

        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(body));
    }

}
