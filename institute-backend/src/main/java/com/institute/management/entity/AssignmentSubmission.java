package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_submissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "content_text", columnDefinition = "TEXT")
    private String contentText;

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;

    private String grade; // e.g. "A+", "B", "Fail"
    
    @Column(columnDefinition = "TEXT")
    private String feedback;

    private String status; // SUBMITTED, GRADED

    @PrePersist
    protected void onCreate() {
        submissionDate = LocalDateTime.now();
        if (status == null) status = "SUBMITTED";
    }
}
