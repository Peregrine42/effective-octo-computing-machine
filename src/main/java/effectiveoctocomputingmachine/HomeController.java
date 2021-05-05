package effectiveoctocomputingmachine;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;
import javax.persistence.Tuple;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import effectiveoctocomputingmachine.authconfig.SecurityConfig;

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

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping(value = "/users/new")
    public String createForm() {
        return "new";
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping(value = "/users")
    public ModelAndView create(RedirectAttributes redirectAttributes, String username, String password,
            String passwordConfirm) {

        ModelAndView response = null;
        List<String> errors = new ArrayList<String>();

        if (!password.equals(passwordConfirm)) {
            errors.add("The password confirmation must exactly match the original password.");
        }

        if (errors.size() == 0) {
            try {
                EntityManager entityManager = entityManagerFactory.createEntityManager();
                String encryptedPassword = security.passwordEncoder().encode(password);
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
                response = new ModelAndView("redirect:/users", new HashMap<String, String>());
                redirectAttributes.addFlashAttribute("success", "Successfully created a new user.");
            } catch (PersistenceException e) {
                if (e.getCause().getCause().getMessage().contains("Key (username)=(username) already exists.")) {
                    errors.add("A user with that username already exists.");
                }
            }
        }

        if (errors.size() > 0) {
            HashMap<String, Object> view = new HashMap<String, Object>();
            view.put("errors", errors);
            response = new ModelAndView("new", view);
        }

        return response;
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