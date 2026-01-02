package skku.gymbarofit.core.user;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.experimental.SuperBuilder;
import skku.gymbarofit.core.dto.MemberRegisterRequestDto;

@Entity
@Table(name = "MEMBERS")
@SuperBuilder
public class Member extends User{

    private Gender gender;

    public Member() { super(); }

    public static Member from(MemberRegisterRequestDto dto) {
        return Member.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .gender(dto.getGender())
                .role(UserRole.ROLE_MEMBER)
                .build();
    }
}
