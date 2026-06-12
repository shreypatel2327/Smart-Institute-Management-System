package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admission_trackings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdmissionTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "inquiry_id", nullable = false)
    private Inquiry inquiry;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private User employee; // Admission Employee checking this lead

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "last_contacted_at")
    private LocalDateTime lastContactedAt;

    private String status; // ACTIVE, CONVERTED, INACTIVE
}
