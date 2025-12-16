package com.example.SkillForge.repository;

import com.example.SkillForge.entity.StudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {
    
    Optional<StudentProgress> findByEnrollmentIdAndLearningMaterialId(Long enrollmentId, Long learningMaterialId);
    
    List<StudentProgress> findByEnrollmentId(Long enrollmentId);
    
    List<StudentProgress> findByEnrollmentIdAndCompletedTrue(Long enrollmentId);
    
    @Query("SELECT COUNT(sp) FROM StudentProgress sp WHERE sp.enrollment.id = :enrollmentId AND sp.completed = true")
    Long countCompletedMaterialsByEnrollment(Long enrollmentId);
    
    @Query("SELECT AVG(sp.progressPercentage) FROM StudentProgress sp WHERE sp.enrollment.id = :enrollmentId")
    Double getAverageProgressByEnrollment(Long enrollmentId);
    
    @Query("SELECT sp FROM StudentProgress sp WHERE sp.enrollment.student.id = :studentId AND sp.enrollment.course.id = :courseId")
    List<StudentProgress> findByStudentIdAndCourseId(Long studentId, Long courseId);
}
