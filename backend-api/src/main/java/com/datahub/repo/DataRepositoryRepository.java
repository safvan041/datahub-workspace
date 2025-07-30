package com.datahub.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

public interface DataRepositoryRepository extends JpaRepository<DataRepository, UUID> {
}