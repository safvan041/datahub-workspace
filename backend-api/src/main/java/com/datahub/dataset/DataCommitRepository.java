package com.datahub.dataset;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface DataCommitRepository extends JpaRepository<DataCommit, UUID> {
    List<DataCommit> findByOriginalFileIdOrderByCreatedAtDesc(UUID originalFileId);

    @Query("SELECT dc FROM DataCommit dc " +
            "JOIN FETCH dc.originalFile of " +
            "JOIN FETCH of.repository r " + 
            "JOIN FETCH r.owner " +
            "WHERE dc.id = :id")
    Optional<DataCommit> findByIdWithRelations(@Param("id") UUID id);
}