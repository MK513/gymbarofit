package skku.gymbarofit.api.gym;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import skku.gymbarofit.core.gym.dto.GymResponseDto;

import static org.springframework.data.domain.Sort.*;

@RestController
@RequestMapping("/gyms")
@RequiredArgsConstructor
public class GymApiController {

    private final GymService gymService;

    @GetMapping("/search")
    public Page<GymResponseDto> search(
            @RequestParam String keyword,
            @PageableDefault(size = 10, sort = "id", direction = Direction.DESC) Pageable pageable
    ) {
        return gymService.searchByKeyword(keyword, pageable);
    }
}
