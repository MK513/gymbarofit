package skku.gymbarofit.core.service;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import skku.gymbarofit.core.repository.MemberRepository;

@Transactional
@RequiredArgsConstructor
@Service
public class MemberInternalService {

    private final MemberRepository memberRepository;
}
