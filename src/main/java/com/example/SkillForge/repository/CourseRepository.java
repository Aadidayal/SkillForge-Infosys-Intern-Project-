package com.example.SkillForge.repository;

import com.example.SkillForge.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findByInstructorId(Long instructorId);
    
    List<Course> findByStatus(com.example.SkillForge.enums.CourseStatus status);
    
    List<Course> findByInstructorIdAndStatus(Long instructorId, com.example.SkillForge.enums.CourseStatus status);
    
    @Query("SELECT COUNT(c) FROM Course c WHERE c.instructor.id = :instructorId AND c.status = :status")
    Long countByInstructorIdAndStatus(Long instructorId, com.example.SkillForge.enums.CourseStatus status);
    
    @Query("SELECT c FROM Course c WHERE c.status = 'PUBLISHED' ORDER BY c.createdAt DESC")
    List<Course> findPublishedCoursesOrderByNewest();
    
    @Query("SELECT c FROM Course c JOIN FETCH c.instructor WHERE c.status = :status")
    List<Course> findByStatusWithInstructor(com.example.SkillForge.enums.CourseStatus status);
    
    @Query("SELECT c FROM Course c JOIN FETCH c.instructor")
    List<Course> findAllWithInstructor();
    
    @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId AND e.paymentStatus = 'COMPLETED'")
    Long countEnrolledStudents(Long courseId);
}