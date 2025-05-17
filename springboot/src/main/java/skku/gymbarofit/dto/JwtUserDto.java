package skku.gymbarofit.dto;

import lombok.Getter;

@Getter
public class JwtUserDto {
    private String email;
    private String role;

    public JwtUserDto(String email, String role) {
        this.role = role;
        this.email = email;
    }
}