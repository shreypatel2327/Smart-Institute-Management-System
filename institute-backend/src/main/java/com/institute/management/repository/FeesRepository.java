package com.institute.management.repository;

import com.institute.management.entity.Fees;
import com.institute.management.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeesRepository extends JpaRepository<Fees, Long> {
    Optional<Fees> findByStudent(Student student);
    List<Fees> findByPaymentStatus(String paymentStatus);
}
