package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "middle_name")
    private String middleName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    private String city;

    @Column(name = "mobile_number", nullable = false)
    private String mobileNumber;

    @Column(name = "father_occupation")
    private String fatherOccupation;

    @Column(name = "father_mobile")
    private String fatherMobile;

    @Column(name = "mother_occupation")
    private String motherOccupation;

    @Column(name = "mother_mobile")
    private String motherMobile;

    @Column(name = "reference_source")
    private String referenceSource; // Newspaper, Social Media Ads, Friends/Relatives, Other

    @Column(name = "other_reference")
    private String otherReference;

    private String stage; // LEAD, INQUIRY, SEMINAR, BOOTCAMP, COUNSELLING, FOLLOW_UP_1, FOLLOW_UP_2, FOLLOW_UP_3, FOLLOW_UP_4, FOLLOW_UP_5, ADMISSION

    private String status; // ACTIVE, CONVERTED, INACTIVE

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (stage == null) stage = "LEAD";
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
