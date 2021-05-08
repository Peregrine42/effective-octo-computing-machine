package effectiveoctocomputingmachine;

import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.PersistenceException;
import javax.persistence.Query;
import javax.persistence.Tuple;

import com.mitchellbosecke.pebble.PebbleEngine;
import com.mitchellbosecke.pebble.template.PebbleTemplate;

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

    public static <T> List<T> castList(Class<? extends T> clazz, Collection<?> c) {
        List<T> r = new ArrayList<T>(c.size());
        for (Object o : c)
            r.add(clazz.cast(o));
        return r;
    }

    @GetMapping(value = "/users")
    @PreAuthorize("isAuthenticated()")
    public ModelAndView users() throws IOException {
        PebbleEngine engine = new PebbleEngine.Builder().build();
        PebbleTemplate compiledTemplate = engine.getTemplate("src/main/resources/sql/listUsers.sql");
        Writer writer = new StringWriter();
        Map<String, Object> context = new HashMap<>();
        compiledTemplate.evaluate(writer, context);
        String queryString = writer.toString();

        EntityManager entityManager = entityManagerFactory.createEntityManager();
        Query query = entityManager.createNativeQuery(queryString);
        List<Object> results = castList(Object.class, query.getResultList());
        HashMap<String, Object> view = new HashMap<String, Object>();
        view.put("users", results);
        return new ModelAndView("users", view);
    }

    @GetMapping(value = "/users/new")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String createForm() {
        return "new";
    }

    @PostMapping(value = "/users")
    @PreAuthorize("hasAuthority('ADMIN')")
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