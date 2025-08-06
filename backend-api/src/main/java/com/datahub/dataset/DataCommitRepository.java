package com.datahub.dataset;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DataCommitRepository extends JpaRepository<DataCommit, UUID> {
    List<DataCommit> findByOriginalFileIdOrderByCreatedAtDesc(UUID originalFileId);
}