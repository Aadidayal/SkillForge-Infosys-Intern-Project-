package com.example.SkillForge.repository;

import com.example.SkillForge.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    boolean existsByStudentIdAndCourseIdAndPaymentStatus(Long studentId, Long courseId, String paymentStatus);
    
    List<Enrollment> findByStudentId(Long studentId);
    
    List<Enrollment> findByCourseId(Long courseId);
    
    Long countByCourseId(Long courseId);
    
    List<Enrollment> findByStudentIdAndPaymentStatus(Long studentId, String paymentStatus);
}