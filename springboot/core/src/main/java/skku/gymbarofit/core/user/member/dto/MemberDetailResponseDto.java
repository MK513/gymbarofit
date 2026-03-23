package skku.gymbarofit.core.user.member.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.user.member.Member;

@AllArgsConstructor
@Getter
@ToString
public class MemberDetailResponseDto {

    private Long id;
    private String email;
    private String username;

    public static MemberDetailResponseDto of(Member member) {
        return new MemberDetailResponseDto(member.getId(), member.getEmail(), member.getUsername());
    }
}
