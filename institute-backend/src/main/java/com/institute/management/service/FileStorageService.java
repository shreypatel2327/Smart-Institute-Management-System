package com.institute.management.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            // Create root upload directory
            Files.createDirectories(this.fileStorageLocation);
            // Create sub-folders
            Files.createDirectories(this.fileStorageLocation.resolve("certificates"));
            Files.createDirectories(this.fileStorageLocation.resolve("materials"));
            Files.createDirectories(this.fileStorageLocation.resolve("assignments"));
            Files.createDirectories(this.fileStorageLocation.resolve("videos"));
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String subFolder) {
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";

        try {
            // Check if the file's name contains invalid characters
            if (originalFileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + originalFileName);
            }

            int lastIndex = originalFileName.lastIndexOf('.');
            if (lastIndex != -1) {
                fileExtension = originalFileName.substring(lastIndex);
            }

            // Generate unique name
            String fileName = UUID.randomUUID().toString() + fileExtension;

            // Target path
            Path targetLocation = this.fileStorageLocation.resolve(subFolder).resolve(fileName);

            // Copy file to target
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative path for web access, e.g. "uploads/materials/uuid.pdf"
            return "uploads/" + subFolder + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
        }
    }
}
