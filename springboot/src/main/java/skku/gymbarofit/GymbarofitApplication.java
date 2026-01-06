package skku.gymbarofit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GymbarofitApplication {

	public static void main(String[] args) {
		SpringApplication.run(GymbarofitApplication.class, args);
	}

}
