package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import com.institute.management.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/students")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    TimetableRepository timetableRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    StudyMaterialRepository studyMaterialRepository;

    @Autowired
    VideoTutorialRepository videoTutorialRepository;

    @Autowired
    FeedbackRepository feedbackRepository;

    @Autowired
    OnlineClassRepository onlineClassRepository;

    @Autowired
    AssignmentRepository assignmentRepository;

    @Autowired
    AssignmentSubmissionRepository submissionRepository;

    @Autowired
    CertificateRepository certificateRepository;

    @Autowired
    FileStorageService fileStorageService;

    // Helper method to retrieve student linked to currently authenticated User
    private Student getCurrentStudent() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user: " + user.getUsername()));
    }

    @GetMapping("/profile")
    public ResponseEntity<Student> getProfile() {
        return ResponseEntity.ok(getCurrentStudent());
    }

    @GetMapping("/timetable")
    public ResponseEntity<List<Timetable>> getTimetable() {
        Student student = getCurrentStudent();
        if (student.getBatch() == null) {
            return ResponseEntity.ok(List.of()); // No batch assigned yet
        }
        return ResponseEntity.ok(timetableRepository.findByBatch(student.getBatch()));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        return ResponseEntity.ok(notificationRepository.findByTargetRoleOrUserOrderByCreatedAtDesc(Role.ROLE_STUDENT, user));
    }

    @GetMapping("/materials")
    public ResponseEntity<List<StudyMaterial>> getMaterials() {
        Student student = getCurrentStudent();
        if (student.getBatch() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(studyMaterialRepository.findByBatch(student.getBatch()));
    }

    @GetMapping("/videos")
    public ResponseEntity<List<VideoTutorial>> getVideos() {
        Student student = getCurrentStudent();
        if (student.getBatch() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(videoTutorialRepository.findByBatch(student.getBatch()));
    }

    @GetMapping("/online-classes")
    public ResponseEntity<List<OnlineClass>> getOnlineClasses() {
        Student student = getCurrentStudent();
        if (student.getBatch() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(onlineClassRepository.findByBatch(student.getBatch()));
    }

    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@RequestBody Feedback feedbackInput) {
        Student student = getCurrentStudent();
        if (student.getBatch() == null) {
            return ResponseEntity.badRequest().body("Student is not assigned to any batch");
        }

        Feedback feedback = Feedback.builder()
                .student(student)
                .batch(student.getBatch())
                .faculty(feedbackInput.getFaculty())
                .topicExplanation(feedbackInput.getTopicExplanation())
                .subjectKnowledge(feedbackInput.getSubjectKnowledge())
                .communicationSkills(feedbackInput.getCommunicationSkills())
                .practicalKnowledge(feedbackInput.getPracticalKnowledge())
                .doubtSolving(feedbackInput.getDoubtSolving())
                .comments(feedbackInput.getComments())
                .build();

        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Assignment>> getAssignments() {
        Student student = getCurrentStudent();
        if (student.getBatch() == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(assignmentRepository.findByBatch(student.getBatch()));
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ResponseEntity<?> submitAssignment(@PathVariable Long assignmentId,
                                               @RequestParam(value = "file", required = false) MultipartFile file,
                                               @RequestParam(value = "contentText", required = false) String contentText) {
        Student student = getCurrentStudent();
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        String filePath = null;
        if (file != null && !file.isEmpty()) {
            filePath = fileStorageService.storeFile(file, "assignments");
        }

        // Check if already submitted
        AssignmentSubmission submission = submissionRepository.findByAssignmentAndStudent(assignment, student)
                .orElse(null);

        if (submission == null) {
            submission = AssignmentSubmission.builder()
                    .assignment(assignment)
                    .student(student)
                    .filePath(filePath)
                    .contentText(contentText)
                    .status("SUBMITTED")
                    .build();
        } else {
            submission.setFilePath(filePath != null ? filePath : submission.getFilePath());
            submission.setContentText(contentText != null ? contentText : submission.getContentText());
            submission.setSubmissionDate(LocalDateTime.now());
            submission.setStatus("SUBMITTED");
        }

        AssignmentSubmission saved = submissionRepository.save(submission);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/certificates")
    public ResponseEntity<List<Certificate>> getCertificates() {
        Student student = getCurrentStudent();
        return ResponseEntity.ok(certificateRepository.findByStudent(student));
    }

    // Monaco compiler execution mockup
    @PostMapping("/run-code")
    public ResponseEntity<?> runCode(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String language = payload.get("language");

        Map<String, Object> response = new HashMap<>();
        response.put("language", language);
        response.put("timestamp", LocalDateTime.now());

        if (code == null || code.trim().isEmpty()) {
            response.put("status", "ERROR");
            response.put("output", "Error: Code snippet cannot be empty.");
            return ResponseEntity.ok(response);
        }

        // Mock output logic based on language
        response.put("status", "SUCCESS");
        String output;
        switch (language.toLowerCase()) {
            case "java":
                output = "Compiling Class...\nJava HotSpot(TM) 64-Bit VM execution successful.\nOutput:\nHello, World! (Java Runtime)";
                break;
            case "python":
                output = "Python execution successful.\nOutput:\nHello, World! (Python 3.10)";
                break;
            case "javascript":
                output = "JavaScript execution successful.\nOutput:\nHello, World! (V8 Engine)";
                break;
            case "cpp":
                output = "g++ compiling files...\nC++ binary compiled and executed.\nOutput:\nHello, World! (C++20)";
                break;
            case "c":
                output = "gcc compiling files...\nC binary compiled and executed.\nOutput:\nHello, World! (C99)";
                break;
            case "sql":
                output = "Query executed successfully.\n+----+------------+------------+\n| ID | First Name | Last Name  |\n+----+------------+------------+\n|  1 | Alice      | Wonderland |\n|  2 | Charlie    | Brown      |\n+----+------------+------------+\n(2 rows affected)";
                break;
            default:
                output = "Execution successful.\nCode run simulated.";
        }
        response.put("output", output);
        return ResponseEntity.ok(response);
    }
}
