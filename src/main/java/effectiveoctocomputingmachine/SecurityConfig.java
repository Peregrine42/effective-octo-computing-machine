package effectiveoctocomputingmachine;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Override
    protected void configure(final AuthenticationManagerBuilder auth) throws Exception {
        auth.inMemoryAuthentication().withUser("testuser").password(passwordEncoder().encode("testpassword"))
                .roles("ADMIN").and().withUser("newuser").password(passwordEncoder().encode("testpassword"))
                .roles("ADMIN");
    }

    @Bean
    public SuccessAuthHandler successHandler() {
        SuccessAuthHandler handler = new SuccessAuthHandler();
        return handler;
    }

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        http.authorizeRequests().antMatchers("/sign-in").permitAll().anyRequest().authenticated().and().formLogin()
                .loginPage("/sign-in").loginProcessingUrl("/sign-in").successHandler(successHandler()).and().logout()
                .logoutUrl("/sign-out");
    }
}