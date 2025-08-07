package com.datahub.dataset;

import com.datahub.storage.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
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
    private DataCommitRepository dataCommitRepository;

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
    
    @PostMapping("/api/files/{fileId}/clean")
    public Object cleanFile(
        @PathVariable UUID fileId,
        @RequestBody CleaningRequestBody body,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        DatasetFile file = datasetFileRepository.findByIdWithRepoAndOwner(fileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        if (!file.getRepository().getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to clean this file");
        }

        String dataEngineUrl = "http://localhost:8000/clean";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestBody = Map.of(
            "file_path", file.getFilePath(),
            "script_content", body.getScript()
        );

        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
        
        return restTemplate.postForObject(dataEngineUrl, request, Object.class);
    }

    @PostMapping("/api/files/{fileId}/commit")
    public ResponseEntity<DataCommit> commitCleanedFile(
        @PathVariable UUID fileId,
        @RequestBody CommitRequestBody body,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        // 1. Security check
        DatasetFile originalFile = datasetFileRepository.findByIdWithRepoAndOwner(fileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        if (!originalFile.getRepository().getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to commit to this file");
        }

        // 2. Call the Python data-engine
        String dataEngineUrl = "http://localhost:8000/clean";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> requestBody = Map.of(
            "file_path", originalFile.getFilePath(),
            "script_content", body.getScript()
        );
        HttpEntity<Map<String, String>> request = new HttpEntity<>(requestBody, headers);
        
        // Get the response as a structured List of Maps
        List<Map<String, Object>> cleanedData = restTemplate.exchange(
            dataEngineUrl, 
            HttpMethod.POST, 
            request, 
            new ParameterizedTypeReference<List<Map<String, Object>>>() {}
        ).getBody();
        
        // 3. Convert the cleaned JSON data back to a CSV string
        String csvContent = fileStorageService.convertJsonToCsv(cleanedData);

        // 4. Save the new CSV content to a new versioned file
        String newFilePath = fileStorageService.saveCleanedData(
            csvContent, 
            originalFile.getRepository().getId(), 
            originalFile.getFileName()
        );

        // 5. Create and save the commit metadata
        DataCommit newCommit = new DataCommit();
        newCommit.setCommitMessage(body.getCommitMessage());
        newCommit.setScriptContent(body.getScript());
        newCommit.setOutputFilePath(newFilePath);
        newCommit.setOriginalFile(originalFile);
        DataCommit savedCommit = dataCommitRepository.save(newCommit);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedCommit);
    }
    
    @GetMapping("/api/files/{fileId}/commits")
    public List<DataCommit> getCommitHistory(
        @PathVariable UUID fileId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        DatasetFile originalFile = datasetFileRepository.findByIdWithRepoAndOwner(fileId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

        if (!originalFile.getRepository().getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this file's history");
        }

        return dataCommitRepository.findByOriginalFileIdOrderByCreatedAtDesc(fileId);
    }
}

// DTO Classes
class CommitRequestBody {
    private String script;
    private String commitMessage;
    public String getScript() { return script; }
    public void setScript(String script) { this.script = script; }
    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }
}

class CleaningRequestBody {
    private String script;
    public String getScript() { return script; }
    public void setScript(String script) { this.script = script; }
}