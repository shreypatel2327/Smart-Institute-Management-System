package com.institute.management.repository;

import com.institute.management.entity.Certificate;
import com.institute.management.entity.Student;
import com.institute.management.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByStudent(Student student);
    List<Certificate> findByBatch(Batch batch);
    Optional<Certificate> findByCertificateNumber(String certificateNumber);
}
