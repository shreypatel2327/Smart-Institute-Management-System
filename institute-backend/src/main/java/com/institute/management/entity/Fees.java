package com.institute.management.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "fees")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Fees {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "paid_amount", nullable = false)
    private Double paidAmount;

    @Column(name = "pending_amount", nullable = false)
    private Double pendingAmount;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_status")
    private String paymentStatus; // PAID, PARTIAL, PENDING

    @Column(name = "last_payment_date")
    private LocalDate lastPaymentDate;
}
