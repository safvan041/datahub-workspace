package com.datahub.repo;

import com.datahub.user.User;
import com.datahub.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/repos")
public class RepositoryController {

    @Autowired
    private DataRepositoryRepository dataRepositoryRepository; // <-- Renamed here

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DataRepository createRepository(@RequestBody RepoRequest request, @AuthenticationPrincipal UserDetails userDetails) { // <-- Renamed here
        User owner = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        DataRepository newRepo = new DataRepository(); // <-- Renamed here
        newRepo.setName(request.getName());
        newRepo.setDescription(request.getDescription());
        newRepo.setOwner(owner);

        return dataRepositoryRepository.save(newRepo); // <-- Renamed here
    }
}

class RepoRequest {
    private String name;
    private String description;
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}