package skku.gymbarofit.dto;

import lombok.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDto<T> {
    private HttpStatus status;
    private String message;
    private List<T> data;

    public ResponseDto(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
