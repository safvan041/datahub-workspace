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

// #b8e6eb3e-e888-4251-9d75-72be0d125fd7
// #efc9728a-5b3e-4b01-9c0c-b3d66d62177f