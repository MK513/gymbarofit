package skku.gymbarofit.dto;

import lombok.Getter;
import skku.gymbarofit.domain.status.RoleStatus;

import java.util.Collection;

@Getter
public class JwtUserDto {
    private Long userId;
    private String email;
    private RoleStatus role;

    public JwtUserDto(Long userId, String email, RoleStatus role) {
        this.userId = userId;
        this.role = role;
        this.email = email;
    }
}