package com.datahub.dataset;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "data_commits")
public class DataCommit {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String commitMessage;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String scriptContent;

    @Column(nullable = false)
    private String outputFilePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_file_id", nullable = false)
    private DatasetFile originalFile;

    @CreationTimestamp
    private LocalDateTime createdAt;
}