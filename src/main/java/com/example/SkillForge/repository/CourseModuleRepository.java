package com.example.SkillForge.repository;

import com.example.SkillForge.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    
    List<CourseModule> findByCourseIdOrderByModuleOrderAsc(Long courseId);
    
    List<CourseModule> findByCourseIdAndIsPublishedTrueOrderByModuleOrderAsc(Long courseId);
    
    @Query("SELECT cm FROM CourseModule cm WHERE cm.course.instructor.id = :instructorId ORDER BY cm.course.id, cm.moduleOrder")
    List<CourseModule> findByInstructorIdOrderByCourseAndModule(@Param("instructorId") Long instructorId);
    
    @Query("SELECT MAX(cm.moduleOrder) FROM CourseModule cm WHERE cm.course.id = :courseId")
    Integer findMaxModuleOrderByCourseId(@Param("courseId") Long courseId);
}