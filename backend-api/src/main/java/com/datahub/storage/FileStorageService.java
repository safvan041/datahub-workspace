package com.datahub.storage;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
            Files.copy(file.getInputStream(), filePath);

            return filePath.toString();
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }

    // --- THIS IS THE NEW METHOD ---
    public List<Map<String, String>> readCsv(String filePath) throws IOException {
        List<Map<String, String>> data = new ArrayList<>();
        Path path = Paths.get(filePath);

        try (BufferedReader br = new BufferedReader(new FileReader(path.toFile()))) {
            String headerLine = br.readLine();
            if (headerLine == null) {
                return data; // Return empty list if file is empty
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
                        row.put(headers[i].trim(), ""); // Handle rows with missing values
                    }
                }
                data.add(row);
            }
        }
        return data;
    }
}