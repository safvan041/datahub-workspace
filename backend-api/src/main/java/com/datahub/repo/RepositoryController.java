package com.datahub.repo;

import com.datahub.repo.RepoDashboardDTO;
import com.datahub.dataset.DatasetFile;
import com.datahub.dataset.DatasetFileRepository;
import com.datahub.storage.FileStorageService;
import com.datahub.user.User;
import com.datahub.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
public class RepositoryController {

    @Autowired
    private DataRepositoryRepository dataRepositoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private DatasetFileRepository datasetFileRepository;

    @PostMapping("/api/repos")
    @ResponseStatus(HttpStatus.CREATED)
    public DataRepository createRepository(@RequestBody RepoRequest request, @AuthenticationPrincipal UserDetails userDetails) {
        User owner = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        DataRepository newRepo = new DataRepository();
        newRepo.setName(request.getName());
        newRepo.setDescription(request.getDescription());
        newRepo.setOwner(owner);

        return dataRepositoryRepository.save(newRepo);
    }

    @GetMapping("/api/repos")
    public List<DataRepository> getRepositoriesForUser(@AuthenticationPrincipal UserDetails userDetails) {
        User owner = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        return dataRepositoryRepository.findByOwnerId(owner.getId());
    }
    
    @GetMapping("/api/repos/{repoId}")
    public DataRepository getRepositoryById(@PathVariable UUID repoId, @AuthenticationPrincipal UserDetails userDetails) {
        DataRepository repo = dataRepositoryRepository.findByIdWithOwner(repoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Repository not found"));

        if (!repo.getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this repository");
        }

        return repo;
    }

    @PostMapping("/api/repos/{repoId}/upload")
    public ResponseEntity<String> uploadFile(@PathVariable UUID repoId, @RequestParam("file") MultipartFile file, @AuthenticationPrincipal UserDetails userDetails) {
        DataRepository repo = dataRepositoryRepository.findById(repoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Repository not found"));

        if (!repo.getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to upload to this repository");
        }
        
        try {
            String filePath = fileStorageService.save(file, repoId);

            DatasetFile newFile = new DatasetFile();
            newFile.setFileName(file.getOriginalFilename());
            newFile.setFilePath(filePath);
            newFile.setRepository(repo);
            datasetFileRepository.save(newFile);

            return ResponseEntity.status(HttpStatus.OK).body("Uploaded the file successfully: " + file.getOriginalFilename());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not upload the file. Error: " + e.getMessage());
        }
    }

    @GetMapping("/api/repos/{repoId}/files")
    public List<DatasetFile> getRepositoryFiles(@PathVariable UUID repoId, @AuthenticationPrincipal UserDetails userDetails) {
        // First, use the existing method to verify ownership, which handles security
        DataRepository repo = this.getRepositoryById(repoId, userDetails);
        
        // Then, return the files for that repository
        return datasetFileRepository.findByRepositoryId(repo.getId());
    }

    @GetMapping("/api/repos/dashboard")
    public List<RepoDashboardDTO> getDashboardRepositories(@AuthenticationPrincipal UserDetails userDetails) {
        User owner = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return dataRepositoryRepository.findDashboardInfoByOwnerId(owner.getId());
    }
}

// This class can stay in the same file for simplicity
class RepoRequest {
    private String name;
    private String description;
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}