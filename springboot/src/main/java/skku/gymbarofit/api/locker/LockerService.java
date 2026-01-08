package skku.gymbarofit.api.locker;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.item.locker.service.LockerZoneInternalService;

@Transactional
@Service
@RequiredArgsConstructor
public class LockerService {


    private final LockerZoneInternalService lockerZoneInternalService;

//    public Object findAll() {
//        lockerZoneInternalService.findByGym
//    }
}
