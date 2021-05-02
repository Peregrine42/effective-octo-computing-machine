package effectiveoctocomputingmachine;

import javax.sql.DataSource;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class JpaConfig {

    @Bean
    public DataSource getDataSource() {
        return DataSourceBuilder.create().driverClassName("org.postgresql.Driver").url(getDataSourceUrl())
                .username(System.getenv("DATABASE_USERNAME")).password(System.getenv("DATABASE_PASSWORD")).build();
    }

    private String getDataSourceUrl() {
        return "jdbc:postgresql://" + System.getenv("DATABASE_HOST") + ":" + System.getenv("DATABASE_PORT") + "/"
                + System.getenv("DATABASE_NAME");
    }
}
