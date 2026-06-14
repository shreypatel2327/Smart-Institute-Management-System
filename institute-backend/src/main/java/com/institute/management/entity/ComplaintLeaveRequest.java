package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_leave_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintLeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // COMPLAINT, LEAVE

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "target_user_id")
    private User targetUser; // Null for leave requests, or who the complaint is about

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient; // Who the complaint is sent to / who should resolve it

    @Column(name = "target_type")
    private String targetType; // FACULTY, ADMIN, STUDENT, SUPER_ADMIN

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "attachment_url")
    private String attachmentUrl; // Optional uploaded proof/file

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED, RESOLVED

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
