package com.datahub.repo;

import java.time.LocalDateTime;
import java.util.UUID;

public class RepoDashboardDTO {
    private UUID id;
    private String name;
    private String description;
    private Long fileCount;
    private LocalDateTime lastCommitDate;

    // Constructor
    public RepoDashboardDTO(UUID id, String name, String description, Long fileCount, LocalDateTime lastCommitDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.fileCount = fileCount;
        this.lastCommitDate = lastCommitDate;
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getFileCount() { return fileCount; }
    public void setFileCount(Long fileCount) { this.fileCount = fileCount; }
    public LocalDateTime getLastCommitDate() { return lastCommitDate; }
    public void setLastCommitDate(LocalDateTime lastCommitDate) { this.lastCommitDate = lastCommitDate; }
}