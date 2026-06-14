package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import com.institute.management.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/complaints-leaves")
public class ComplaintLeaveController {

    @Autowired
    ComplaintLeaveRequestRepository requestRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FacultyRepository facultyRepository;

    @Autowired
    FileStorageService fileStorageService;

    private User getCurrentUser() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userPrincipal.getId()).orElse(null);
    }

    private int getRoleRank(Role role) {
        if (role == Role.ROLE_STUDENT) return 1;
        if (role == Role.ROLE_FACULTY) return 2;
        if (role == Role.ROLE_ADMIN) return 3;
        if (role == Role.ROLE_SUPER_ADMIN) return 4;
        return 0;
    }

    // 1. Submit request
    @PostMapping
    public ResponseEntity<?> submitRequest(@RequestParam("type") String type, // COMPLAINT, LEAVE, RECORDING_REQUEST
                                           @RequestParam("message") String message,
                                           @RequestParam(value = "recipientUserId", required = false) Long recipientUserId,
                                           @RequestParam(value = "targetUserId", required = false) Long targetUserId,
                                           @RequestParam(value = "targetType", required = false) String targetType,
                                           @RequestParam(value = "file", required = false) MultipartFile file) {

        User sender = getCurrentUser();
        String attachmentUrl = null;

        if (file != null && !file.isEmpty()) {
            attachmentUrl = fileStorageService.storeFile(file, "materials"); // Reuse materials folder
        }

        User targetUser = null;
        if (targetUserId != null) {
            targetUser = userRepository.findById(targetUserId).orElse(null);
        }

        User recipient = null;
        if (recipientUserId != null) {
            recipient = userRepository.findById(recipientUserId).orElse(null);
        }

        if (recipient == null) {
            return ResponseEntity.badRequest().body("Error: Recipient user must be specified.");
        }

        // Validate lower-to-higher rank hierarchy
        int senderRank = getRoleRank(sender.getRole());
        int recipientRank = getRoleRank(recipient.getRole());

        if (recipientRank <= senderRank) {
            return ResponseEntity.badRequest().body("Error: Complaints and requests can only be sent to a higher position/power.");
        }

        if ("COMPLAINT".equalsIgnoreCase(type) && targetUser != null) {
            int targetRank = getRoleRank(targetUser.getRole());
            if (recipientRank <= targetRank) {
                return ResponseEntity.badRequest().body("Error: Recipient must have a higher position than the target of the complaint.");
            }
        }

        ComplaintLeaveRequest req = ComplaintLeaveRequest.builder()
                .type(type.toUpperCase())
                .sender(sender)
                .targetUser(targetUser)
                .recipient(recipient)
                .targetType(targetType != null ? targetType.toUpperCase() : null)
                .message(message)
                .attachmentUrl(attachmentUrl)
                .status("PENDING")
                .build();

        return ResponseEntity.ok(requestRepository.save(req));
    }

    // 2. Fetch requests depending on roles (sender or recipient only)
    @GetMapping
    public ResponseEntity<?> getRequests() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.badRequest().body("User not logged in");
        }

        List<ComplaintLeaveRequest> all = requestRepository.findAll();
        List<ComplaintLeaveRequest> filtered = all.stream()
                .filter(r -> r.getSender().getId().equals(user.getId()) || 
                             (r.getRecipient() != null && r.getRecipient().getId().equals(user.getId())))
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(filtered);
    }

    // 3. Resolve, Approve or Reject request status (Recipient or Admin/Super Admin only)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateRequestStatus(@PathVariable Long id,
                                                 @RequestParam("status") String status) {
        User user = getCurrentUser();
        ComplaintLeaveRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        boolean isRecipient = req.getRecipient() != null && req.getRecipient().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ROLE_SUPER_ADMIN || user.getRole() == Role.ROLE_ADMIN;

        if (!isRecipient && !isAdmin) {
            return ResponseEntity.badRequest().body("Error: Unauthorized to modify this request status!");
        }

        req.setStatus(status.toUpperCase());
        return ResponseEntity.ok(requestRepository.save(req));
    }

    // 4. Get complaint target users list dynamically (returns all users except caller)
    @GetMapping("/targets")
    public ResponseEntity<?> getComplaintTargets() {
        User user = getCurrentUser();
        List<User> targets = userRepository.findAll();
        targets.removeIf(u -> u.getId().equals(user.getId()));

        // Project fields to simple map to avoid sending password hashes
        List<java.util.Map<String, Object>> mapped = targets.stream()
                .map(u -> {
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", u.getId());
                    map.put("name", u.getFirstName() + " " + u.getLastName() + " (" + u.getRole().name().substring(5).replace("_", " ") + ")");
                    map.put("role", u.getRole().name());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(mapped);
    }
}
