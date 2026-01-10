package skku.gymbarofit.api.gym;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.gym.dto.GymResponseDto;
import skku.gymbarofit.core.gym.service.GymInternalService;

@Transactional
@Service
@RequiredArgsConstructor
public class GymService {

    private final GymInternalService gymInternalService;

    @Transactional(readOnly = true)
    public Page<GymResponseDto> searchByKeyword(String keyword, Pageable pageable) {

        String kw = keyword == null ? "" : keyword.trim();
        if (kw.isEmpty()) return Page.empty(pageable);

        return gymInternalService.findByKeyword(kw, pageable)
                .map(GymResponseDto::from);
    }
}
