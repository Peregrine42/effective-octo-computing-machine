package effectiveoctocomputingmachine;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

import java.io.UnsupportedEncodingException;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Tuple;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import effectiveoctocomputingmachine.authconfig.SecurityConfig;

@SpringBootTest(classes = Application.class, webEnvironment = WebEnvironment.RANDOM_PORT)
public class HomeControllerTest {

	@Autowired
	private WebApplicationContext webApplicationContext;

	@Autowired
	EntityManagerFactory entityManagerFactory;

	@Autowired
	private SecurityConfig security;

	@Test
	@WithMockUser(username = "testuser", authorities = { "ADMIN" })
	public void testUserCreateWithDifferingPasswordsEntered() throws Exception {
		MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
		String response = mockMvc.perform(post("/users").param("username", "username").param("password", "password")
				.param("passwordConfirm", "different-password")).andReturn().getResponse().getContentAsString();
		assertThat(response, containsString("Users - New"));
		assertThat(response, containsString("The password confirmation must exactly match the original password."));
	}

	@Test
	@WithMockUser(username = "testuser", authorities = { "ADMIN" })
	public void testUserCreateExistingUsernameEntered() throws UnsupportedEncodingException, Exception {
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

		MockMvc mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
		String response = mockMvc.perform(post("/users").param("username", "username").param("password", "password")
				.param("passwordConfirm", "password")).andReturn().getResponse().getContentAsString();
		assertThat(response, containsString("Users - New"));
		assertThat(response, containsString("A user with that username already exists."));
	}

}
