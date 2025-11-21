package com.example.SkillForge.repository;

import com.example.SkillForge.entity.ModuleContent;
import com.example.SkillForge.enums.ContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ModuleContentRepository extends JpaRepository<ModuleContent, Long> {
    
    List<ModuleContent> findByCourseModuleIdOrderByContentOrderAsc(Long moduleId);
    
    List<ModuleContent> findByCourseModuleIdAndIsPublishedTrueOrderByContentOrderAsc(Long moduleId);
    
    List<ModuleContent> findByContentType(ContentType contentType);
    
    @Query("SELECT mc FROM ModuleContent mc WHERE mc.courseModule.course.instructor.id = :instructorId ORDER BY mc.courseModule.course.id, mc.courseModule.moduleOrder, mc.contentOrder")
    List<ModuleContent> findByInstructorIdOrderByCourseModuleAndContent(@Param("instructorId") Long instructorId);
    
    @Query("SELECT MAX(mc.contentOrder) FROM ModuleContent mc WHERE mc.courseModule.id = :moduleId")
    Integer findMaxContentOrderByModuleId(@Param("moduleId") Long moduleId);
    
    @Query("SELECT COUNT(mc) FROM ModuleContent mc WHERE mc.courseModule.id = :moduleId AND mc.isPublished = true")
    Long countPublishedContentByModuleId(@Param("moduleId") Long moduleId);
}