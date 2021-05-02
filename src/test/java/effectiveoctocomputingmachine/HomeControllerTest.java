package effectiveoctocomputingmachine;

import static org.junit.jupiter.api.Assertions.assertEquals;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Tuple;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.web.servlet.ModelAndView;

@SpringBootTest(classes = Application.class)
public class HomeControllerTest {

    @Autowired
    HomeController homeController;

    @Autowired
    EntityManagerFactory entityManagerFactory;

    @Autowired
    private SecurityConfig security;

    @WithMockUser(username = "testuser", authorities = { "ADMIN" })
    public void testUserCreateWithDifferingPasswordsEntered() {
        ModelAndView result = homeController.create("username", "password", "different-password");
        assertEquals("new", result.getViewName());
    }

    @Test
    @WithMockUser(username = "testuser", authorities = { "ADMIN" })
    public void testUserCreateExistingUsernameEntered() {
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        entityManager.getTransaction().begin();
        entityManager.createNativeQuery("delete from roles", Tuple.class).executeUpdate();
        entityManager.createNativeQuery("delete from users", Tuple.class).executeUpdate();
        entityManager.getTransaction().commit();

        String encryptedPassword = security.passwordEncoder().encode("password");

        entityManager.getTransaction().begin();
        entityManager
                .createNativeQuery(
                        "insert into users (username, encrypted_password, enabled) values (:username, :password, 't')",
                        Tuple.class)
                .setParameter("username", "username").setParameter("password", encryptedPassword).executeUpdate();
        entityManager
                .createNativeQuery(
                        "insert into roles (username, authority, enabled) values (:username, :authority, 't')",
                        Tuple.class)
                .setParameter("username", "username").setParameter("authority", "USER").executeUpdate();
        entityManager.getTransaction().commit();

        ModelAndView result = homeController.create("username", "password", "password");
        assertEquals("new", result.getViewName());
    }

}
