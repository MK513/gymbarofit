package skku.gymbarofit.core.item.locker.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.Locker;
import skku.gymbarofit.core.item.locker.repository.LockerRepository;

import java.util.List;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerInternalService {

    private final LockerRepository LockerRepository;

    @Transactional(readOnly = true)
    public List<Locker> findAllByZoneId(Long zoneId) {
        return LockerRepository.findAllByLockerZoneId(zoneId);
    }
}
