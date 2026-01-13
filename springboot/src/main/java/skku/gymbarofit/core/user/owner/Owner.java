package skku.gymbarofit.core.user.owner;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.experimental.SuperBuilder;
import skku.gymbarofit.core.user.User;
import skku.gymbarofit.core.user.owner.dto.OwnerRegisterRequestDto;
import skku.gymbarofit.core.user.enums.UserRole;

@Entity
@SuperBuilder
@Table(name = "OWNERS")
public class Owner extends User {

    private String businessNumber;

    public Owner() { super(); }

    public static Owner from(OwnerRegisterRequestDto dto, String encodedPassword) {
        return Owner.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(encodedPassword)
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .businessNumber(dto.getBusinessNumber())
                .build();
    }
}
