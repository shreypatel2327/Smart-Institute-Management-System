package com.institute.management.repository;

import com.institute.management.entity.Batch;
import com.institute.management.entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByName(String name);
    Optional<Batch> findByCode(String code);
    List<Batch> findByFaculty(Faculty faculty);
}
