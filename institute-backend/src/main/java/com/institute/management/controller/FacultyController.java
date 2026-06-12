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
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/faculties")
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    FacultyRepository facultyRepository;

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    LectureRepository lectureRepository;

    @Autowired
    AssignmentRepository assignmentRepository;

    @Autowired
    AssignmentSubmissionRepository submissionRepository;

    @Autowired
    StudyMaterialRepository studyMaterialRepository;

    @Autowired
    VideoTutorialRepository videoTutorialRepository;

    @Autowired
    OnlineClassRepository onlineClassRepository;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    SubjectRepository subjectRepository;

    @Autowired
    FileStorageService fileStorageService;

    private Faculty getCurrentFaculty() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return facultyRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user: " + user.getUsername()));
    }

    @GetMapping("/profile")
    public ResponseEntity<Faculty> getProfile() {
        return ResponseEntity.ok(getCurrentFaculty());
    }

    @GetMapping("/batches")
    public ResponseEntity<List<Batch>> getMyBatches() {
        return ResponseEntity.ok(batchRepository.findByFaculty(getCurrentFaculty()));
    }

    // 1. Lecture Management
    @PostMapping("/lectures")
    public ResponseEntity<?> scheduleLecture(@RequestBody Lecture lectureRequest) {
        Faculty faculty = getCurrentFaculty();
        Lecture lecture = Lecture.builder()
                .title(lectureRequest.getTitle())
                .date(lectureRequest.getDate())
                .startTime(lectureRequest.getStartTime())
                .endTime(lectureRequest.getEndTime())
                .batch(lectureRequest.getBatch())
                .subject(lectureRequest.getSubject())
                .faculty(faculty)
                .status("SCHEDULED")
                .build();
        return ResponseEntity.ok(lectureRepository.save(lecture));
    }

    @GetMapping("/lectures")
    public ResponseEntity<List<Lecture>> getMyLectures() {
        return ResponseEntity.ok(lectureRepository.findByFaculty(getCurrentFaculty()));
    }

    @PutMapping("/lectures/{id}")
    public ResponseEntity<?> updateLectureStatus(@PathVariable Long id, @RequestParam String status) {
        Lecture lecture = lectureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lecture not found"));
        
        // Safety: verify faculty owns it
        if (!lecture.getFaculty().getId().equals(getCurrentFaculty().getId())) {
            return ResponseEntity.badRequest().body("You cannot modify this lecture schedule");
        }

        lecture.setStatus(status.toUpperCase());
        return ResponseEntity.ok(lectureRepository.save(lecture));
    }

    // 2. Study Material Management
    @PostMapping("/materials")
    public ResponseEntity<?> uploadMaterial(@RequestParam("title") String title,
                                             @RequestParam("description") String description,
                                             @RequestParam("batchId") Long batchId,
                                             @RequestParam("subjectId") Long subjectId,
                                             @RequestParam("file") MultipartFile file) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        String filePath = fileStorageService.storeFile(file, "materials");
        String extension = "";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.lastIndexOf('.') != -1) {
            extension = orig.substring(orig.lastIndexOf('.') + 1);
        }

        StudyMaterial material = StudyMaterial.builder()
                .title(title)
                .description(description)
                .filePath(filePath)
                .fileType(extension.toUpperCase())
                .batch(batch)
                .subject(subject)
                .uploadedBy(user)
                .build();

        return ResponseEntity.ok(studyMaterialRepository.save(material));
    }

    // 3. Video Tutorial Management
    @PostMapping("/videos")
    public ResponseEntity<?> uploadVideo(@RequestParam("title") String title,
                                         @RequestParam("description") String description,
                                         @RequestParam("batchId") Long batchId,
                                         @RequestParam("subjectId") Long subjectId,
                                         @RequestParam(value = "file", required = false) MultipartFile file,
                                         @RequestParam(value = "videoUrl", required = false) String videoUrl) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);

        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

        String videoPath = null;
        if (file != null && !file.isEmpty()) {
            videoPath = fileStorageService.storeFile(file, "videos");
        }

        VideoTutorial video = VideoTutorial.builder()
                .title(title)
                .description(description)
                .videoUrl(videoUrl)
                .videoPath(videoPath)
                .batch(batch)
                .subject(subject)
                .uploadedBy(user)
                .build();

        return ResponseEntity.ok(videoTutorialRepository.save(video));
    }

    // 4. Assignments Management
    @PostMapping("/assignments")
    public ResponseEntity<?> createAssignment(@RequestParam("title") String title,
                                              @RequestParam("description") String description,
                                              @RequestParam("deadline") String deadlineStr,
                                              @RequestParam("batchId") Long batchId,
                                              @RequestParam(value = "file", required = false) MultipartFile file) {
        Faculty faculty = getCurrentFaculty();
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        String filePath = null;
        if (file != null && !file.isEmpty()) {
            filePath = fileStorageService.storeFile(file, "assignments");
        }

        Assignment assignment = Assignment.builder()
                .title(title)
                .description(description)
                .deadline(LocalDateTime.parse(deadlineStr))
                .filePath(filePath)
                .batch(batch)
                .faculty(faculty)
                .build();

        return ResponseEntity.ok(assignmentRepository.save(assignment));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<Assignment>> getMyAssignments() {
        return ResponseEntity.ok(assignmentRepository.findByFaculty(getCurrentFaculty()));
    }

    @GetMapping("/assignments/{id}/submissions")
    public ResponseEntity<List<AssignmentSubmission>> getAssignmentSubmissions(@PathVariable Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        return ResponseEntity.ok(submissionRepository.findByAssignment(assignment));
    }

    @PutMapping("/submissions/{id}/grade")
    public ResponseEntity<?> gradeSubmission(@PathVariable Long id,
                                             @RequestParam String grade,
                                             @RequestParam String feedback) {
        AssignmentSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        submission.setGrade(grade);
        submission.setFeedback(feedback);
        submission.setStatus("GRADED");

        return ResponseEntity.ok(submissionRepository.save(submission));
    }

    // 5. Notifications Broadcast
    @PostMapping("/notifications")
    public ResponseEntity<?> sendAnnouncement(@RequestParam("title") String title,
                                              @RequestParam("message") String message,
                                              @RequestParam(value = "batchId", required = false) Long batchId) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User sender = userRepository.findById(userPrincipal.getId()).orElse(null);

        if (batchId != null) {
            Batch batch = batchRepository.findById(batchId)
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
            // For simple implementation, broadcast message to role, but faculty sends text specifying batch
            Notification notification = Notification.builder()
                    .title("[" + batch.getName() + "] " + title)
                    .message(message)
                    .targetRole(Role.ROLE_STUDENT)
                    .sentBy(sender)
                    .build();
            return ResponseEntity.ok(notificationRepository.save(notification));
        } else {
            Notification notification = Notification.builder()
                    .title(title)
                    .message(message)
                    .targetRole(Role.ROLE_STUDENT)
                    .sentBy(sender)
                    .build();
            return ResponseEntity.ok(notificationRepository.save(notification));
        }
    }

    // 6. Online Class Creation (Jitsi room auto-gen)
    @PostMapping("/online-classes")
    public ResponseEntity<?> scheduleOnlineClass(@RequestBody OnlineClass classRequest) {
        Faculty faculty = getCurrentFaculty();
        
        // Generate a random unique room name for Jitsi integration
        String roomName = "smart-inst-" + UUID.randomUUID().toString().substring(0, 8);
        String jitsiLink = "https://meet.jit.si/" + roomName;

        OnlineClass onlineClass = OnlineClass.builder()
                .title(classRequest.getTitle())
                .meetingId(roomName)
                .meetingLink(jitsiLink)
                .batch(classRequest.getBatch())
                .subject(classRequest.getSubject())
                .faculty(faculty)
                .scheduledTime(classRequest.getScheduledTime())
                .durationMinutes(classRequest.getDurationMinutes() != null ? classRequest.getDurationMinutes() : 60)
                .status("UPCOMING")
                .build();

        return ResponseEntity.ok(onlineClassRepository.save(onlineClass));
    }

    @GetMapping("/online-classes")
    public ResponseEntity<List<OnlineClass>> getMyOnlineClasses() {
        return ResponseEntity.ok(onlineClassRepository.findByFaculty(getCurrentFaculty()));
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<Subject>> getSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }
}
