package skku.gymbarofit.core.user.member;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.experimental.SuperBuilder;
import skku.gymbarofit.core.Reservation;
import skku.gymbarofit.core.user.User;
import skku.gymbarofit.core.user.member.dto.MemberRegisterRequestDto;
import skku.gymbarofit.core.global.enums.Gender;
import skku.gymbarofit.core.global.enums.UserRole;

@Entity
@Table(name = "MEMBERS")
@SuperBuilder
public class Member extends User {

    @Enumerated(EnumType.STRING)
    private Gender gender;

    public Member() { super(); }

    public static Member from(MemberRegisterRequestDto dto, String encodedPassword) {
        return Member.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(encodedPassword)
                .phoneNumber(dto.getPhoneNumber())
                .address(dto.getAddress())
                .gender(dto.getGender())
                .role(UserRole.ROLE_MEMBER)
                .build();
    }
}
