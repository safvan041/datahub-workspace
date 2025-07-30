package com.datahub.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

public interface DataRepositoryRepository extends JpaRepository<DataRepository, UUID> {
    List<DataRepository> findByOwnerId(UUID ownerId);
}