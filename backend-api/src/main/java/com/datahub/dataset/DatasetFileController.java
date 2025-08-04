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
public class DatasetFileController {

    @Autowired
    private DatasetFileRepository datasetFileRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/api/files/{fileId}/view")
    public List<Map<String, String>> viewFileContent(
        @PathVariable UUID fileId,
        @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        // Find the file and its owner using our new secure method
        DatasetFile file = datasetFileRepository.findByIdWithRepoAndOwner(fileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        // Security check: Ensure the logged-in user is the owner
        if (!file.getRepository().getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this file");
        }

        // Read the file from disk and return its content
        return fileStorageService.readCsv(file.getFilePath());
    }
}