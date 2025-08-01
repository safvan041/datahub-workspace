package com.datahub.storage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get(System.getProperty("user.home"), "datahub-uploads");

    public FileStorageService() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    public String save(MultipartFile file, UUID repoId) {
        try {
            Path repoDirectory = root.resolve(repoId.toString());
            Files.createDirectories(repoDirectory);

            Path filePath = repoDirectory.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), filePath);

            // Return the full path of the saved file as a string
            return filePath.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }
}