package skku.gymbarofit.api.membership.dto;

import skku.gymbarofit.core.membership.Membership;
import skku.gymbarofit.core.membership.enums.MembershipStatus;

import java.time.LocalDate;

public record GymMemberResponseDto(
        Long memberId,
        String name,
        String email,
        String phoneNumber,
        LocalDate joinedAt,
        MembershipStatus status,
        LocalDate expiredAt
) {
    public static GymMemberResponseDto of(Membership membership) {
        return new GymMemberResponseDto(
                membership.getMember().getId(),
                membership.getMember().getUsername(),
                membership.getMember().getEmail(),
                membership.getMember().getPhoneNumber(),
                membership.getCreatedAt().toLocalDate(),
                membership.getStatus(),
                membership.getExpiredAt() != null ? membership.getExpiredAt().toLocalDate() : null
        );
    }
}
