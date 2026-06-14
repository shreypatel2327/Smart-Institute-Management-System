package com.institute.management.repository;

import com.institute.management.entity.DynamicForm;
import com.institute.management.entity.DynamicFormResponse;
import com.institute.management.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DynamicFormResponseRepository extends JpaRepository<DynamicFormResponse, Long> {
    List<DynamicFormResponse> findByForm(DynamicForm form);
    List<DynamicFormResponse> findBySubmittedBy(Student student);
    Boolean existsByFormAndSubmittedBy(DynamicForm form, Student student);
}
