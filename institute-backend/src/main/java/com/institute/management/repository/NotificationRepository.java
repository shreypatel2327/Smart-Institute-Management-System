package com.institute.management.repository;

import com.institute.management.entity.Notification;
import com.institute.management.entity.Role;
import com.institute.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTargetRoleOrUserOrderByCreatedAtDesc(Role targetRole, User user);
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    List<Notification> findByTargetRoleOrderByCreatedAtDesc(Role targetRole);
}
