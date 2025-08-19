package com.datahub.repo;

import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.datahub.repo.RepoDashboardDTO;

public interface DataRepositoryRepository extends JpaRepository<DataRepository, UUID> {
    List<DataRepository> findByOwnerId(UUID ownerId);

    @Query("SELECT r FROM DataRepository r JOIN FETCH r.owner WHERE r.id = :id")
    Optional<DataRepository> findByIdWithOwner(@Param("id") UUID id);

    @Query("SELECT new com.datahub.repo.RepoDashboardDTO(" +
            "r.id, r.name, r.description, " +
            "(SELECT COUNT(df) FROM DatasetFile df WHERE df.repository = r), " +
            "(SELECT MAX(dc.createdAt) FROM DataCommit dc JOIN dc.originalFile of WHERE of.repository = r)" +
            ") FROM DataRepository r WHERE r.owner.id = :ownerId")
    List<RepoDashboardDTO> findDashboardInfoByOwnerId(@Param("ownerId") UUID ownerId);
}