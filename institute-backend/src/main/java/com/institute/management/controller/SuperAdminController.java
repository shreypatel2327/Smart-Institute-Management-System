package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/superadmins")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SuperAdminController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FacultyRepository facultyRepository;

    @Autowired
    BatchRepository batchRepository;

    @Autowired
    FeesRepository feesRepository;

    @Autowired
    PasswordEncoder encoder;

    // 1. Staff Management (Create/Update/Activate Admin accounts)
    @PostMapping("/staff")
    public ResponseEntity<?> createStaffUser(@RequestBody User staffRequest) {
        if (userRepository.existsByUsername(staffRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(staffRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        Role role = staffRequest.getRole();
        if (role != Role.ROLE_ADMIN) {
            return ResponseEntity.badRequest().body("Error: Super Admin can only register ADMIN staff!");
        }

        User user = User.builder()
                .username(staffRequest.getUsername())
                .email(staffRequest.getEmail())
                .password(encoder.encode(staffRequest.getPassword() != null ? staffRequest.getPassword() : "staff123"))
                .role(role)
                .firstName(staffRequest.getFirstName())
                .lastName(staffRequest.getLastName())
                .phone(staffRequest.getPhone())
                .status("ACTIVE")
                .build();

        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/staff")
    public ResponseEntity<List<User>> getAllStaff() {
        List<User> staff = new ArrayList<>();
        staff.addAll(userRepository.findByRole(Role.ROLE_ADMIN));
        return ResponseEntity.ok(staff);
    }

    @PutMapping("/staff/{id}/toggle-status")
    public ResponseEntity<?> toggleStaffStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        if (user.getRole() == Role.ROLE_SUPER_ADMIN) {
            return ResponseEntity.badRequest().body("Error: Cannot modify status of a Super Admin!");
        }

        if ("ACTIVE".equalsIgnoreCase(user.getStatus())) {
            user.setStatus("DEACTIVATED");
        } else {
            user.setStatus("ACTIVE");
        }

        return ResponseEntity.ok(userRepository.save(user));
    }

    // 2. Fees Dashboard Financial Analytics - REMOVED

    // 3. Batch Dashboard Course/Student Analytics
    @GetMapping("/dashboard/batches")
    public ResponseEntity<?> getBatchDashboardData() {
        long totalBatches = batchRepository.count();
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();

        Map<String, Object> data = new HashMap<>();
        data.put("totalBatches", totalBatches);
        data.put("activeBatches", totalBatches); // Assuming all seeded are active
        data.put("studentCount", totalStudents);
        data.put("facultyCount", totalFaculty);

        // Chart.js stats: Students per batch distribution mock
        List<String> labels = new ArrayList<>();
        List<Integer> values = new ArrayList<>();
        List<Batch> batches = batchRepository.findAll();
        for (Batch b : batches) {
            labels.add(b.getName());
            values.add(studentRepository.findByBatch(b).size());
        }
        data.put("batchLabels", labels);
        data.put("batchStudentCounts", values);

        return ResponseEntity.ok(data);
    }
}
