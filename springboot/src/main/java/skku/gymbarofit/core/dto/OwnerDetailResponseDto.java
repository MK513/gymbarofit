package skku.gymbarofit.core.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import skku.gymbarofit.core.user.Owner;

@AllArgsConstructor
@Getter
@ToString
public class OwnerDetailResponseDto {

    private Long id;
    private String email;
    private String username;

    public static OwnerDetailResponseDto of(Owner owner) {
        return new OwnerDetailResponseDto(owner.getId(), owner.getEmail(), owner.getUsername());
    }
}
