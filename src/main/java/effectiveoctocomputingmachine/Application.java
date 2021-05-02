package effectiveoctocomputingmachine;

import java.util.Properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class Application {
    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(Application.class);

        Properties properties = new Properties();
        properties.put("server.servlet.session.cookie.name", "EFFECTIVECOOKIE");
        properties.put("spring.jpa.open-in-view", false);
        application.setDefaultProperties(properties);

        application.run(args);
    }
}
