package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.*;
import com.lowagie.text.DocumentException;
import com.institute.management.security.UserDetailsImpl;
import com.institute.management.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admins")
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FacultyRepository facultyRepository;

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    SubjectRepository subjectRepository;

    @Autowired
    CertificateRepository certificateRepository;

    @Autowired
    CertificateService certificateService;

    @Autowired
    NotificationRepository notificationRepository;

    @Autowired
    PasswordEncoder encoder;

    // --- STUDENT MANAGEMENT ---
    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @PostMapping("/students")
    @Transactional
    public ResponseEntity<?> createStudent(@RequestBody Student studentRequest) {
        User userReq = studentRequest.getUser();
        if (userRepository.existsByUsername(userReq.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(userReq.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = User.builder()
                .username(userReq.getUsername())
                .email(userReq.getEmail())
                .password(encoder.encode(userReq.getPassword() != null ? userReq.getPassword() : "student123"))
                .role(Role.ROLE_STUDENT)
                .firstName(userReq.getFirstName())
                .lastName(userReq.getLastName())
                .phone(userReq.getPhone())
                .status("ACTIVE")
                .build();
        User savedUser = userRepository.save(user);

        Student student = Student.builder()
                .user(savedUser)
                .rollNumber("STU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .city(studentRequest.getCity())
                .mobileNumber(studentRequest.getMobileNumber())
                .fatherName(studentRequest.getFatherName())
                .fatherOccupation(studentRequest.getFatherOccupation())
                .fatherMobile(studentRequest.getFatherMobile())
                .motherOccupation(studentRequest.getMotherOccupation())
                .motherMobile(studentRequest.getMotherMobile())
                .referenceSource(studentRequest.getReferenceSource())
                .otherReference(studentRequest.getOtherReference())
                .batch(studentRequest.getBatch())
                .status("ACTIVE")
                .build();
        
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @PutMapping("/students/{id}")
    @Transactional
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @RequestBody Student studentRequest) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        User user = student.getUser();
        User userReq = studentRequest.getUser();
        if (userReq != null) {
            user.setEmail(userReq.getEmail());
            user.setFirstName(userReq.getFirstName());
            user.setLastName(userReq.getLastName());
            user.setPhone(userReq.getPhone());
            if (userReq.getPassword() != null && !userReq.getPassword().isEmpty()) {
                user.setPassword(encoder.encode(userReq.getPassword()));
            }
            userRepository.save(user);
        }

        student.setCity(studentRequest.getCity());
        student.setMobileNumber(studentRequest.getMobileNumber());
        student.setFatherName(studentRequest.getFatherName());
        student.setFatherOccupation(studentRequest.getFatherOccupation());
        student.setFatherMobile(studentRequest.getFatherMobile());
        student.setMotherOccupation(studentRequest.getMotherOccupation());
        student.setMotherMobile(studentRequest.getMotherMobile());
        student.setReferenceSource(studentRequest.getReferenceSource());
        student.setOtherReference(studentRequest.getOtherReference());
        student.setBatch(studentRequest.getBatch());

        return ResponseEntity.ok(studentRepository.save(student));
    }

    @DeleteMapping("/students/{id}")
    @Transactional
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        // Remove relationships first or set null
        studentRepository.delete(student);
        return ResponseEntity.ok("Student deleted successfully!");
    }

    // --- FACULTY MANAGEMENT ---
    @GetMapping("/faculties")
    public List<Faculty> getAllFaculties() {
        return facultyRepository.findAll();
    }

    @PostMapping("/faculties")
    @Transactional
    public ResponseEntity<?> createFaculty(@RequestBody Faculty facultyRequest) {
        User userReq = facultyRequest.getUser();
        if (userRepository.existsByUsername(userReq.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        User user = User.builder()
                .username(userReq.getUsername())
                .email(userReq.getEmail())
                .password(encoder.encode(userReq.getPassword() != null ? userReq.getPassword() : "faculty123"))
                .role(Role.ROLE_FACULTY)
                .firstName(userReq.getFirstName())
                .lastName(userReq.getLastName())
                .phone(userReq.getPhone())
                .status("ACTIVE")
                .build();
        User savedUser = userRepository.save(user);

        Faculty faculty = Faculty.builder()
                .user(savedUser)
                .employeeId("FAC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .specialization(facultyRequest.getSpecialization())
                .qualification(facultyRequest.getQualification())
                .status("ACTIVE")
                .build();

        return ResponseEntity.ok(facultyRepository.save(faculty));
    }

    @PutMapping("/faculties/{id}")
    @Transactional
    public ResponseEntity<?> updateFaculty(@PathVariable Long id, @RequestBody Faculty facultyRequest) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));

        User user = faculty.getUser();
        User userReq = facultyRequest.getUser();
        if (userReq != null) {
            user.setEmail(userReq.getEmail());
            user.setFirstName(userReq.getFirstName());
            user.setLastName(userReq.getLastName());
            user.setPhone(userReq.getPhone());
            userRepository.save(user);
        }

        faculty.setSpecialization(facultyRequest.getSpecialization());
        faculty.setQualification(facultyRequest.getQualification());

        return ResponseEntity.ok(facultyRepository.save(faculty));
    }

    @DeleteMapping("/faculties/{id}")
    @Transactional
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found"));
        facultyRepository.delete(faculty);
        return ResponseEntity.ok("Faculty deleted successfully!");
    }

    // --- BATCH MANAGEMENT ---
    @GetMapping("/batches")
    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    @PostMapping("/batches")
    public ResponseEntity<?> createBatch(@RequestBody Batch batch) {
        return ResponseEntity.ok(batchRepository.save(batch));
    }

    @PutMapping("/batches/{id}")
    public ResponseEntity<?> updateBatch(@PathVariable Long id, @RequestBody Batch batchDetails) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        batch.setName(batchDetails.getName());
        batch.setCode(batchDetails.getCode());
        batch.setLectureDays(batchDetails.getLectureDays());
        batch.setTimings(batchDetails.getTimings());
        batch.setStrength(batchDetails.getStrength());
        batch.setFaculty(batchDetails.getFaculty());

        return ResponseEntity.ok(batchRepository.save(batch));
    }

    @DeleteMapping("/batches/{id}")
    public ResponseEntity<?> deleteBatch(@PathVariable Long id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        batchRepository.delete(batch);
        return ResponseEntity.ok("Batch deleted successfully!");
    }

    // --- STUDENT BATCH MAPPING ---
    @PutMapping("/students/{studentId}/map-batch/{batchId}")
    public ResponseEntity<?> mapStudentToBatch(@PathVariable Long studentId, @PathVariable Long batchId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        student.setBatch(batch);
        studentRepository.save(student);
        return ResponseEntity.ok("Student assigned to batch successfully!");
    }

    @PutMapping("/students/{studentId}/unmap-batch")
    public ResponseEntity<?> unmapStudentFromBatch(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        student.setBatch(null);
        studentRepository.save(student);
        return ResponseEntity.ok("Student removed from batch successfully!");
    }

    // --- CERTIFICATE MANAGEMENT ---
    @PostMapping("/certificates/generate/student/{studentId}")
    public ResponseEntity<?> generateStudentCertificate(@PathVariable Long studentId, @RequestParam Long batchId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        Certificate cert = certificateService.generateCertificate(student, batch);
        return ResponseEntity.ok(cert);
    }

    @PostMapping("/certificates/generate/batch/{batchId}")
    public ResponseEntity<?> generateBatchCertificates(@PathVariable Long batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        List<Student> students = studentRepository.findByBatch(batch);
        List<Certificate> generated = new ArrayList<>();
        for (Student student : students) {
            try {
                Certificate cert = certificateService.generateCertificate(student, batch);
                generated.add(cert);
            } catch (Exception e) {
                // log and continue
            }
        }
        return ResponseEntity.ok(generated);
    }

    // --- SUBJECT CRUD ---
    @GetMapping("/subjects")
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @PostMapping("/subjects")
    public Subject createSubject(@RequestBody Subject subject) {
        return subjectRepository.save(subject);
    }

    // --- NOTIFICATIONS BROADCST ---
    @PostMapping("/notifications")
    public ResponseEntity<?> sendSystemNotification(@RequestParam String title,
                                                     @RequestParam String message,
                                                     @RequestParam(required = false) String roleStr) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User sender = userRepository.findById(userPrincipal.getId()).orElse(null);

        Role targetRole = null;
        if (roleStr != null && !roleStr.isEmpty()) {
            targetRole = Role.valueOf("ROLE_" + roleStr.toUpperCase());
        }

        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .targetRole(targetRole)
                .sentBy(sender)
                .build();

        return ResponseEntity.ok(notificationRepository.save(notification));
    }
}
