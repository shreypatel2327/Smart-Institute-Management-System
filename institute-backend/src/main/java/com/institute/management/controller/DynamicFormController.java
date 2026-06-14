package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/forms")
public class DynamicFormController {

    @Autowired
    DynamicFormRepository formRepository;

    @Autowired
    DynamicFormResponseRepository responseRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    private User getCurrentUser() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userPrincipal.getId()).orElse(null);
    }

    // 1. Create Dynamic Form
    @PostMapping
    public ResponseEntity<?> createForm(@RequestBody DynamicForm formRequest) {
        User creator = getCurrentUser();
        DynamicForm form = DynamicForm.builder()
                .title(formRequest.getTitle())
                .description(formRequest.getDescription())
                .fieldsJson(formRequest.getFieldsJson())
                .createdBy(creator)
                .isPublished(formRequest.getIsPublished() != null ? formRequest.getIsPublished() : false)
                .build();
        return ResponseEntity.ok(formRepository.save(form));
    }

    // 2. Publish/Unpublish Form
    @PutMapping("/{id}/publish")
    public ResponseEntity<?> togglePublish(@PathVariable Long id) {
        DynamicForm form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found"));
        form.setIsPublished(!form.getIsPublished());
        return ResponseEntity.ok(formRepository.save(form));
    }

    // 3. Get all published forms (for Students)
    @GetMapping
    public ResponseEntity<List<DynamicForm>> getPublishedForms() {
        return ResponseEntity.ok(formRepository.findByIsPublishedTrueOrderByCreatedAtDesc());
    }

    // 4. Get all forms (for Admins)
    @GetMapping("/all")
    public ResponseEntity<List<DynamicForm>> getAllForms() {
        return ResponseEntity.ok(formRepository.findByOrderByCreatedAtDesc());
    }

    // 5. Get Form by ID
    @GetMapping("/{id}")
    public ResponseEntity<DynamicForm> getFormById(@PathVariable Long id) {
        DynamicForm form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found"));
        return ResponseEntity.ok(form);
    }

    // 6. Student Submits response
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitResponse(@PathVariable Long id, @RequestBody String responsesJson) {
        User user = getCurrentUser();
        Student student = studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        DynamicForm form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found"));

        if (!form.getIsPublished()) {
            return ResponseEntity.badRequest().body("Error: This event form is not open for submissions.");
        }

        // Prevent double submission
        if (responseRepository.existsByFormAndSubmittedBy(form, student)) {
            return ResponseEntity.badRequest().body("Error: You have already submitted responses for this event form.");
        }

        DynamicFormResponse resp = DynamicFormResponse.builder()
                .form(form)
                .submittedBy(student)
                .responsesJson(responsesJson)
                .build();

        return ResponseEntity.ok(responseRepository.save(resp));
    }

    // 7. Get submissions for a Form (for Admins)
    @GetMapping("/{id}/responses")
    public ResponseEntity<List<DynamicFormResponse>> getResponses(@PathVariable Long id) {
        DynamicForm form = formRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found"));
        return ResponseEntity.ok(responseRepository.findByForm(form));
    }
}
