package com.institute.management.repository;

import com.institute.management.entity.DynamicForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DynamicFormRepository extends JpaRepository<DynamicForm, Long> {
    List<DynamicForm> findByIsPublishedTrueOrderByCreatedAtDesc();
    List<DynamicForm> findByOrderByCreatedAtDesc();
}
