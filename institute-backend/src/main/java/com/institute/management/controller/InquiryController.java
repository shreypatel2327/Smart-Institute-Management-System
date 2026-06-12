package com.institute.management.controller;

import com.institute.management.entity.Inquiry;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.InquiryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/inquiries")
public class InquiryController {

    @Autowired
    InquiryRepository inquiryRepository;

    // Public endpoint for student inquiry form submission
    @PostMapping("/submit")
    public ResponseEntity<?> submitInquiry(@Valid @RequestBody Inquiry inquiry) {
        inquiry.setStage("LEAD");
        inquiry.setStatus("ACTIVE");
        Inquiry saved = inquiryRepository.save(inquiry);
        return ResponseEntity.ok(saved);
    }

    // Secured: List all inquiries
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMISSION') or hasRole('SUPER_ADMIN')")
    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAll();
    }

    // Secured: Move inquiry to any stage directly
    @PutMapping("/{id}/stage")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMISSION') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> updateInquiryStage(@PathVariable Long id, @RequestParam String stage) {
        Inquiry inquiry = inquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found with id: " + id));

        inquiry.setStage(stage.toUpperCase());
        if ("ADMISSION".equalsIgnoreCase(stage)) {
            inquiry.setStatus("CONVERTED");
        }
        Inquiry updated = inquiryRepository.save(inquiry);
        return ResponseEntity.ok(updated);
    }

    // Secured: Funnel Reports data
    @GetMapping("/funnel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ADMISSION') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> getFunnelAnalytics() {
        List<Inquiry> inquiries = inquiryRepository.findAll();
        Map<String, Integer> funnel = new HashMap<>();

        // Initialize stages
        String[] stages = {"LEAD", "INQUIRY", "SEMINAR", "BOOTCAMP", "COUNSELLING", 
                           "FOLLOW_UP_1", "FOLLOW_UP_2", "FOLLOW_UP_3", "FOLLOW_UP_4", "FOLLOW_UP_5", "ADMISSION"};
        for (String st : stages) {
            funnel.put(st, 0);
        }

        // Count
        for (Inquiry in : inquiries) {
            String currentStage = in.getStage();
            if (currentStage != null) {
                funnel.put(currentStage, funnel.getOrDefault(currentStage, 0) + 1);
            }
        }

        return ResponseEntity.ok(funnel);
    }
}
