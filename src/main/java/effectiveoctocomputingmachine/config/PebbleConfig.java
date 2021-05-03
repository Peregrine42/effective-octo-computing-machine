package effectiveoctocomputingmachine.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("pebble")
public class PebbleConfig {
    private boolean exposeRequestAttributes = true;

    public boolean isExposeRequestAttributes() {
        return exposeRequestAttributes;
    }
}