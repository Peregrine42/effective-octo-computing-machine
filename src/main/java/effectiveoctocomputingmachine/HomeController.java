package effectiveoctocomputingmachine;

import java.util.HashMap;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
public class HomeController {
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

    @PostMapping(value = "/users")
    public ModelAndView create() {
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