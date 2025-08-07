package com.datahub.dataset;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;

public interface DatasetFileRepository extends JpaRepository<DatasetFile, UUID> {
    List<DatasetFile> findByRepositoryId(UUID repositoryId);

    @Query ("SELECT df FROM DatasetFile df JOIN FETCH df.repository r JOIN FETCH r.owner WHERE df.id = :id")
    Optional<DatasetFile> findByIdWithRepoAndOwner(@Param("id") UUID id);
}

