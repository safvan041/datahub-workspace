package com.datahub.repo;

import org.springframework.data.jpa.repository.JpaRepository; 
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DataRepositoryRepository extends JpaRepository<DataRepository, UUID> {
    List<DataRepository> findByOwnerId(UUID ownerId);

    @Query("SELECT r FROM DataRepository r JOIN FETCH r.owner WHERE r.id = :id")
    Optional<DataRepository> findByIdWithOwner(@Param("id") UUID id);
}