package effectiveoctocomputingmachine;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

import lombok.Data;

@Data
@Entity
public class User {
    @Id
    @Column
    private Long id;

    @Column
    private String username;

    @Column
    private String encryptedPassword;

    @Column
    private Boolean enabled;
}
