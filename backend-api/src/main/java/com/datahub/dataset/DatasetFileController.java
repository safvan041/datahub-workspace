package com.datahub.dataset;

import com.datahub.storage.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class DatasetFileController {

    @Autowired
    private DatasetFileRepository datasetFileRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping("/api/files/{fileId}/view")
    public List<Map<String, String>> viewFileContent(
        @PathVariable UUID fileId,
        @AuthenticationPrincipal UserDetails userDetails
    ) throws IOException {
        DatasetFile file = datasetFileRepository.findByIdWithRepoAndOwner(fileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        if (!file.getRepository().getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this file");
        }
        return fileStorageService.readCsv(file.getFilePath());
    }

    // --- THIS IS THE NEW ENDPOINT ---
    @PostMapping("/api/files/{fileId}/clean")
    public String cleanFile(
        @PathVariable UUID fileId,
        @RequestBody CleaningRequestBody body,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 1. Security check: Ensure user owns the file
        DatasetFile file = datasetFileRepository.findByIdWithRepoAndOwner(fileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        if (!file.getRepository().getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to clean this file");
        }

        // 2. Prepare the request to the Python data-engine
        String dataEngineUrl = "http://localhost:8000/clean";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create the request body for the Python service
        Map<String, String> requestBody = Map.of(
            "file_path", file.getFilePath(),
            "script_content", body.getScript()
        );

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);

        // 3. Call the Python service and return its response
        return restTemplate.postForObject(dataEngineUrl, request, String.class);
    }
}

// A simple class to represent the incoming request body
class CleaningRequestBody {
    private String script;
    public String getScript() { return script; }
    public void setScript(String script) { this.script = script; }
}