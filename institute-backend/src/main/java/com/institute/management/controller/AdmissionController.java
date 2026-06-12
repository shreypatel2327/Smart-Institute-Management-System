package com.institute.management.controller;

import com.institute.management.entity.*;
import com.institute.management.exception.ResourceNotFoundException;
import com.institute.management.repository.*;
import com.institute.management.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admissions")
@PreAuthorize("hasRole('ADMISSION') or hasRole('ADMIN') or hasRole('SUPER_ADMIN')")
public class AdmissionController {

    @Autowired
    InquiryRepository inquiryRepository;

    @Autowired
    AdmissionTrackingRepository trackingRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    StudentRepository studentRepository;

    @Autowired
    FeesRepository feesRepository;

    private User getCurrentUser() {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findById(userPrincipal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found"));
    }

    // 1. Inquiry Follow up Tracking
    @PostMapping("/tracking/{inquiryId}")
    public ResponseEntity<?> addFollowUpNotes(@PathVariable Long inquiryId, @RequestParam String notes) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));

        AdmissionTracking tracking = trackingRepository.findByInquiry(inquiry)
                .orElse(null);

        if (tracking == null) {
            tracking = AdmissionTracking.builder()
                    .inquiry(inquiry)
                    .employee(getCurrentUser())
                    .notes(notes)
                    .lastContactedAt(LocalDateTime.now())
                    .status("ACTIVE")
                    .build();
        } else {
            tracking.setNotes(notes);
            tracking.setEmployee(getCurrentUser());
            tracking.setLastContactedAt(LocalDateTime.now());
        }

        return ResponseEntity.ok(trackingRepository.save(tracking));
    }

    @GetMapping("/tracking/{inquiryId}")
    public ResponseEntity<?> getFollowUpNotes(@PathVariable Long inquiryId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry not found"));
        return ResponseEntity.ok(trackingRepository.findByInquiry(inquiry)
                .orElse(new AdmissionTracking()));
    }

    // 2. Fees Status Tracker
    @GetMapping("/fees")
    public List<Fees> getAllFeesReport() {
        return feesRepository.findAll();
    }

    @PutMapping("/fees/{id}")
    public ResponseEntity<?> updateStudentFees(@PathVariable Long id, 
                                               @RequestParam Double paidAmount) {
        Fees fees = feesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found"));

        double newPaid = fees.getPaidAmount() + paidAmount;
        double newPending = fees.getTotalAmount() - newPaid;
        if (newPending < 0) newPending = 0.0;

        fees.setPaidAmount(newPaid);
        fees.setPendingAmount(newPending);
        fees.setLastPaymentDate(java.time.LocalDate.now());

        if (newPending == 0) {
            fees.setPaymentStatus("PAID");
        } else {
            fees.setPaymentStatus("PARTIAL");
        }

        return ResponseEntity.ok(feesRepository.save(fees));
    }

    // 3. Revoke/Activate Access (Student Portal Access control)
    @PutMapping("/students/{studentId}/toggle-access")
    public ResponseEntity<?> toggleStudentAccess(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        User user = student.getUser();
        if ("ACTIVE".equalsIgnoreCase(user.getStatus())) {
            user.setStatus("DEACTIVATED");
            student.setStatus("INACTIVE");
        } else {
            user.setStatus("ACTIVE");
            student.setStatus("ACTIVE");
        }

        userRepository.save(user);
        studentRepository.save(student);

        return ResponseEntity.ok(new HashMap<>() {{
            put("studentId", student.getId());
            put("status", student.getStatus());
            put("accountStatus", user.getStatus());
        }});
    }

    // 4. Admission Conversion & Funnel Analytics
    @GetMapping("/reports")
    public ResponseEntity<?> getDailyMonthlyReports() {
        long totalInquiries = inquiryRepository.count();
        long convertedCount = inquiryRepository.findByStatus("CONVERTED").size();
        double conversionRate = totalInquiries > 0 ? ((double) convertedCount / totalInquiries) * 100 : 0;

        Map<String, Object> report = new HashMap<>();
        report.put("totalLeads", totalInquiries);
        report.put("admittedStudents", convertedCount);
        report.put("conversionRatePercentage", conversionRate);
        report.put("dailyLeadsCount", 3); // seeded mock daily indicator
        report.put("monthlyLeadsCount", totalInquiries);

        return ResponseEntity.ok(report);
    }
}
