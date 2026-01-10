package skku.gymbarofit.core.gym.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.gym.Gym;
import skku.gymbarofit.core.gym.repository.GymRepository;

import java.util.List;
import java.util.Optional;

@Transactional
@Service
@RequiredArgsConstructor
public class GymInternalService {

    private final GymRepository gymRepository;

    public List<Gym> findGymByMemberId(Long memberId) {
        return gymRepository.findGymByMemberId(memberId);
    }

    public Page<Gym> findByKeyword(String keyword, Pageable pageable) {
        return gymRepository.findByKeyword(keyword, pageable);
    }

    public Optional<Gym> findById(Long id) {
        return gymRepository.findById(id);
    }
}
