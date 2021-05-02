package effectiveoctocomputingmachine;

import java.util.HashMap;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;
import javax.persistence.Tuple;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class HomeController {
    @Autowired
    private EntityManagerFactory entityManagerFactory;

    @Autowired
    private SecurityConfig security;

    @GetMapping(value = "/")
    public String home() {
        return "home";
    }

    @GetMapping(value = "/users")
    public String users() {
        return "users";
    }

    @GetMapping(value = "/users/new")
    public String createForm() {
        return "new";
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/users")
    public ModelAndView create(String username, String password, String passwordConfirm) {
        if (!password.equals(passwordConfirm)) {
            return new ModelAndView("new", new HashMap<String, String>());
        }

        EntityManager entityManager = entityManagerFactory.createEntityManager();

        String encryptedPassword = security.passwordEncoder().encode(password);

        try {
            entityManager.getTransaction().begin();
            entityManager.createNativeQuery(
                    "insert into users (username, encrypted_password, enabled) values (:username, :password, 't')",
                    Tuple.class).setParameter("username", username).setParameter("password", encryptedPassword)
                    .executeUpdate();
            entityManager
                    .createNativeQuery(
                            "insert into roles (username, authority, enabled) values (:username, :authority, 't')",
                            Tuple.class)
                    .setParameter("username", username).setParameter("authority", "USER").executeUpdate();
            entityManager.getTransaction().commit();
        } catch (PersistenceException e) {
            if (e.getCause().getCause().getMessage().contains("Key (username)=(username) already exists.")) {
                return new ModelAndView("new", new HashMap<String, String>());
            }
        }

        return new ModelAndView("redirect:/users", new HashMap<String, String>());
    }

    @PostMapping(value = "/sign-out")
    public ModelAndView signOut() {
        return new ModelAndView("redirect:/", new HashMap<String, String>());
    }

    @GetMapping(value = "/sign-in")
    public String signIn() {
        return "sign-in";
    }
}