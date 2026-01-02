package skku.gymbarofit.core.user;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.experimental.SuperBuilder;
import skku.gymbarofit.core.dto.OwnerRegisterRequestDto;

@Entity
@SuperBuilder
@Table(name = "OWNERS")
public class Owner extends User{

    public Owner() { super(); }

    public static Owner from(OwnerRegisterRequestDto dto) {
        return Owner.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword()) // ⚠️ 암호화는 Service에서
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .role(UserRole.ROLE_OWNER)
                .build();
    }
}
