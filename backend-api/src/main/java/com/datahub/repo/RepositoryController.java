package com.datahub.repo;

import com.datahub.user.User;
import com.datahub.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
public class RepositoryController {

    @Autowired
    private DataRepositoryRepository dataRepositoryRepository;

    @Autowired
    private UserRepository userRepository;

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
        // Find the repository by its ID
        DataRepository repo = dataRepositoryRepository.findByIdWithOwner(repoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Repository not found"));

        // Security check: Make sure the logged-in user is the owner
        if (!repo.getOwner().getUsername().equals(userDetails.getUsername())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this repository");
        }

        return repo;
    }
}

class RepoRequest {
    private String name;
    private String description;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}