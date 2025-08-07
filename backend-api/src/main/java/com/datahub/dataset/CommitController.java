package com.datahub.dataset;

import com.datahub.storage.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class CommitController {

    @Autowired
    private DataCommitRepository dataCommitRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/api/commits/{commitId}/view")
    public List<Map<String, String>> viewCommitContent(
        @PathVariable UUID commitId,
        @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        // 1. Find the commit and its owner using our new secure method
        DataCommit commit = dataCommitRepository.findByIdWithRelations(commitId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Commit not found"));

        // 2. Security check: Ensure the logged-in user is the owner
        if (!commit.getOriginalFile().getRepository().getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this commit");
        }

        // 3. Read the specific versioned file from disk and return its content
        return fileStorageService.readCsv(commit.getOutputFilePath());
    }
}