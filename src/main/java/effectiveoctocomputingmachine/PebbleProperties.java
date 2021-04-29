package effectiveoctocomputingmachine;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("pebble")
public class PebbleProperties {
    private boolean exposeRequestAttributes = true;

    public boolean isExposeRequestAttributes() {
        return exposeRequestAttributes;
    }
}