package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import com.institute.management.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
public class EnhancedNotificationController {

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    FeedbackRepository feedbackRepository;

    @Autowired
    FileStorageService fileStorageService;

    // Helper to get logged-in User
    private User getCurrentUser() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userPrincipal.getId()).orElse(null);
    }

    // 1. Send Enhanced Notification
    @PostMapping
    public ResponseEntity<?> sendNotification(@RequestParam(value = "title", required = false) String title,
                                             @RequestParam(value = "message", required = false) String message,
                                             @RequestParam("targetType") String targetType, // ALL, BATCH, ROLE, USERS
                                             @RequestParam(value = "roleStr", required = false) String roleStr,
                                             @RequestParam(value = "batchId", required = false) Long batchId,
                                             @RequestParam(value = "userIds", required = false) String userIdsStr,
                                             @RequestParam(value = "file", required = false) MultipartFile file,
                                             @RequestParam(value = "attachmentType", required = false) String attachmentTypeInput) {

        User sender = getCurrentUser();
        String attachmentUrl = null;
        String attachmentType = null;

        if (file != null && !file.isEmpty()) {
            String orig = file.getOriginalFilename();
            String extension = "";
            if (orig != null && orig.lastIndexOf('.') != -1) {
                extension = orig.substring(orig.lastIndexOf('.') + 1).toLowerCase();
            }

            // Decide upload subfolder based on file extension / type
            String subFolder = "materials";
            if (Arrays.asList("jpg", "jpeg", "png", "gif").contains(extension)) {
                subFolder = "certificates"; // or create images folder, but we reuse existing folders
                attachmentType = "IMAGE";
            } else if (Arrays.asList("mp3", "wav", "m4a").contains(extension)) {
                subFolder = "materials";
                attachmentType = "AUDIO";
            } else if (Arrays.asList("mp4", "mkv", "avi").contains(extension)) {
                subFolder = "videos";
                attachmentType = "VIDEO";
            } else if ("pdf".equals(extension)) {
                subFolder = "materials";
                attachmentType = "PDF";
            } else {
                subFolder = "materials";
                attachmentType = "FILE";
            }

            if (attachmentTypeInput != null && !attachmentTypeInput.isEmpty()) {
                attachmentType = attachmentTypeInput.toUpperCase();
            }

            attachmentUrl = fileStorageService.storeFile(file, subFolder);
        }

        // Default title if empty (attachment only)
        String finalTitle = (title != null && !title.isEmpty()) ? title : "File Attachment Notice";
        String finalMessage = (message != null && !message.isEmpty()) ? message : "Attached media notice shared.";

        List<Notification> created = new ArrayList<>();

        if ("ALL".equalsIgnoreCase(targetType)) {
            if (sender.getRole() != Role.ROLE_SUPER_ADMIN) {
                return ResponseEntity.status(403).body(Map.of("message", "Only Super Admin is allowed to send messages to all users."));
            }
            // Global Notice: targetRole = null, user = null, batch = null
            Notification notification = Notification.builder()
                    .title(finalTitle)
                    .message(finalMessage)
                    .attachmentUrl(attachmentUrl)
                    .attachmentType(attachmentType)
                    .sentBy(sender)
                    .build();
            created.add(notificationRepository.save(notification));

        } else if ("BATCH".equalsIgnoreCase(targetType) && batchId != null) {
            Batch batch = batchRepository.findById(batchId).orElse(null);
            if (batch != null) {
                Notification notification = Notification.builder()
                        .title(finalTitle)
                        .message(finalMessage)
                        .attachmentUrl(attachmentUrl)
                        .attachmentType(attachmentType)
                        .batch(batch)
                        .targetRole(Role.ROLE_STUDENT)
                        .sentBy(sender)
                        .build();
                created.add(notificationRepository.save(notification));
            }

        } else if ("ROLE".equalsIgnoreCase(targetType) && roleStr != null) {
            Role role = Role.valueOf("ROLE_" + roleStr.toUpperCase());
            Notification notification = Notification.builder()
                    .title(finalTitle)
                    .message(finalMessage)
                    .attachmentUrl(attachmentUrl)
                    .attachmentType(attachmentType)
                    .targetRole(role)
                    .sentBy(sender)
                    .build();
            created.add(notificationRepository.save(notification));

        } else if ("USERS".equalsIgnoreCase(targetType) && userIdsStr != null) {
            List<Long> ids = Arrays.stream(userIdsStr.split(","))
                    .map(String::trim)
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            for (Long id : ids) {
                User user = userRepository.findById(id).orElse(null);
                if (user != null) {
                    Notification notification = Notification.builder()
                            .title(finalTitle)
                            .message(finalMessage)
                            .attachmentUrl(attachmentUrl)
                            .attachmentType(attachmentType)
                            .user(user)
                            .sentBy(sender)
                            .build();
                    created.add(notificationRepository.save(notification));
                }
            }
        }

        return ResponseEntity.ok(created);
    }

    // 2. Fetch Notifications Inbox for Logged-In User
    @GetMapping("/my-inbox")
    public ResponseEntity<?> getMyInbox() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.badRequest().body("User not logged in");
        }

        // We fetch:
        // - Notifications targeted to user role
        // - Notifications targeted directly to user ID
        // - Global notifications (targetRole = null, user = null, batch = null)
        // - If Student, notifications targeted to their Batch
        
        Batch studentBatch = null;
        if (user.getRole() == Role.ROLE_STUDENT) {
            Student student = studentRepository.findByUser(user).orElse(null);
            if (student != null) {
                studentBatch = student.getBatch();
                
                // Dynamic feedback reminder check
                java.time.DayOfWeek day = java.time.LocalDate.now().getDayOfWeek();
                boolean isWeekend = (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY);
                if (isWeekend) {
                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime startOfWeek = now.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                            .withHour(0).withMinute(0).withSecond(0).withNano(0);
                    LocalDateTime endOfWeek = startOfWeek.plusDays(7).minusNanos(1);
                    
                    // Check if feedback already submitted
                    boolean feedbackSubmitted = feedbackRepository.findAll().stream()
                            .anyMatch(f -> f.getStudent().getId().equals(student.getId()) &&
                                           f.getCreatedAt() != null &&
                                           f.getCreatedAt().isAfter(startOfWeek) &&
                                           f.getCreatedAt().isBefore(endOfWeek));
                    
                    if (!feedbackSubmitted) {
                        // Check if reminder notification already exists for this week
                        boolean reminderExists = notificationRepository.findAll().stream()
                                .anyMatch(n -> n.getUser() != null && n.getUser().getId().equals(user.getId()) &&
                                               "Weekly Faculty Feedback Reminder".equals(n.getTitle()) &&
                                               n.getCreatedAt() != null &&
                                               n.getCreatedAt().isAfter(startOfWeek) &&
                                               n.getCreatedAt().isBefore(endOfWeek));
                        if (!reminderExists) {
                            // Find system/admin user or just use sender as Super Admin/system
                            User systemUser = userRepository.findByRole(Role.ROLE_SUPER_ADMIN).stream().findFirst().orElse(user);
                            Notification feedbackReminder = Notification.builder()
                                    .title("Weekly Faculty Feedback Reminder")
                                    .message("It's the weekend! Please take a moment to submit your feedback for your instructor.")
                                    .user(user)
                                    .sentBy(systemUser)
                                    .build();
                            notificationRepository.save(feedbackReminder);
                        }
                    }
                }
            }
        }

        List<Notification> allNotifs = notificationRepository.findAll();
        List<Notification> filtered = new ArrayList<>();

        for (Notification notif : allNotifs) {
            boolean isMatch = false;

            // Direct mapping
            if (notif.getUser() != null && notif.getUser().getId().equals(user.getId())) {
                isMatch = true;
            }
            // Role mapping
            else if (notif.getTargetRole() != null && notif.getTargetRole() == user.getRole()) {
                // If it maps to batch, check student's batch
                if (notif.getBatch() != null) {
                    if (studentBatch != null && notif.getBatch().getId().equals(studentBatch.getId())) {
                        isMatch = true;
                    }
                } else {
                    isMatch = true;
                }
            }
            // Global notice
            else if (notif.getTargetRole() == null && notif.getUser() == null && notif.getBatch() == null) {
                isMatch = true;
            }

            if (isMatch) {
                filtered.add(notif);
            }
        }

        // Sort descending by createdAt
        filtered.sort((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()));

        return ResponseEntity.ok(filtered);
    }

    // 3. Admin view all sent notifications
    @GetMapping("/sent")
    public ResponseEntity<?> getSentNotifications() {
        User user = getCurrentUser();
        // Return all notifications sent by current user
        List<Notification> all = notificationRepository.findAll();
        List<Notification> sent = all.stream()
                .filter(n -> n.getSentBy() != null && n.getSentBy().getId().equals(user.getId()))
                .sorted((n1, n2) -> n2.getCreatedAt().compareTo(n1.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(sent);
    }
}
