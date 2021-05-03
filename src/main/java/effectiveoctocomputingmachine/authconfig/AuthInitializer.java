package effectiveoctocomputingmachine.authconfig;

import java.util.EnumSet;

import javax.servlet.ServletContext;
import javax.servlet.SessionTrackingMode;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.DelegatingFilterProxy;

public class AuthInitializer implements WebApplicationInitializer {
    @Override
    public void onStartup(ServletContext sc) {
        AnnotationConfigWebApplicationContext root = new AnnotationConfigWebApplicationContext();
        root.register(SecurityConfig.class);
        sc.addListener(new ContextLoaderListener(root));
        sc.addFilter("securityFilter", new DelegatingFilterProxy("springSecurityFilterChain"))
                .addMappingForUrlPatterns(null, false, "/*");
        sc.setSessionTrackingModes(EnumSet.of(SessionTrackingMode.COOKIE));
    }
}