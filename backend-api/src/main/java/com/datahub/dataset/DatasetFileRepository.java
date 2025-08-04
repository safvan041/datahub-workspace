package com.datahub.dataset;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DatasetFileRepository extends JpaRepository<DatasetFile, UUID> {
    List<DatasetFile> findByRepositoryId(UUID repositoryId);
}