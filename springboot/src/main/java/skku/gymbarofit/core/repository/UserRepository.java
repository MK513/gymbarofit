package skku.gymbarofit.core.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import skku.gymbarofit.core.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

//    private final EntityManager em;
//
//    public void save(User user) {
//        em.persist(user);
//    }
//
//    public User findOne(Long id) {
//        return em.find(User.class, id);
//    }
//
//    public List<User> findAll() {
//        return em.createQuery("select u from User u", User.class)
//                .getResultList();
//    }
//
//    public Optional<User> findByEmail(String email) {
//            return em.createQuery("select u from User u where u.email = :email", User.class)
//                    .setParameter("email", email)
//                    .getResultList()
//                    .stream().findAny();
//    }
}
