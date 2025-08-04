package com.datahub.repo;

import com.datahub.user.User;
import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "repositories")
public class DataRepository {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    // --- THIS IS THE FIX ---
    // Manually add the getter for the ID
    public UUID getId() {
        return this.id;
    }
}