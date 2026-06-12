package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(name = "certificate_type", nullable = false)
    private String certificateType; // e.g. "COMPLETION", "EXCELLENCE"

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @Column(name = "certificate_number", unique = true, nullable = false)
    private String certificateNumber;
}
