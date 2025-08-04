package com.datahub.storage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
// Add imports
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
            // Allow replacing existing file with same name
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return filePath.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    // --- THIS IS THE NEW METHOD ---
    public String saveCleanedData(String cleanedData, UUID repoId, String originalFileName) {
        try {
            Path repoDirectory = root.resolve(repoId.toString());
            Files.createDirectories(repoDirectory);

            // Create a new versioned filename
            String newFileName = "cleaned-" + System.currentTimeMillis() + "-" + originalFileName;
            Path newFilePath = repoDirectory.resolve(newFileName);

            // Write the string content to the new file
            Files.write(newFilePath, cleanedData.getBytes());

            return newFilePath.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not store cleaned file. Error: " + e.getMessage());
        }
    }

    public List<Map<String, String>> readCsv(String filePath) throws IOException {
        // ... this method is unchanged ...
        List<Map<String, String>> data = new ArrayList<>();
        Path path = Paths.get(filePath);

        try (BufferedReader br = new BufferedReader(new FileReader(path.toFile()))) {
            String headerLine = br.readLine();
            if (headerLine == null) {
                return data;
            }
            String[] headers = headerLine.split(",");
            String line;
            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");
                Map<String, String> row = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    if (i < values.length) {
                        row.put(headers[i].trim(), values[i].trim());
                    } else {
                        row.put(headers[i].trim(), "");
                    }
                }
                data.add(row);
            }
        }
        return data;
    }
}