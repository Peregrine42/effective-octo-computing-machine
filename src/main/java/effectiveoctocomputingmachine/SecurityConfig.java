package effectiveoctocomputingmachine;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Autowired
    private DataSource dataSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(16, 32, 1, 4096, 3);
    }

    @Override
    protected void configure(final AuthenticationManagerBuilder auth) throws Exception {
        auth.jdbcAuthentication().dataSource(dataSource).usersByUsernameQuery(
                "select username, encrypted_password as password, enabled from users where username = ? and enabled = 't'")
                .authoritiesByUsernameQuery(
                        "select username, authority from roles where username = ? and enabled = 't'");
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