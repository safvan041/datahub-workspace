package com.datahub.dataset;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DataCommitRepository extends JpaRepository<DataCommit, UUID> {
}