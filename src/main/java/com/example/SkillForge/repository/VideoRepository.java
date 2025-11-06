package com.example.SkillForge.repository;

import com.example.SkillForge.entity.Video;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository extends JpaRepository<Video, Long> {
    
    List<Video> findByCourseIdOrderByOrderIndex(Long courseId);
    
    @Query("SELECT v FROM Video v WHERE v.course.id = :courseId AND v.isPreview = true")
    List<Video> findPreviewVideosByCourseId(Long courseId);
    
    @Query("SELECT v FROM Video v WHERE v.course.instructor.id = :instructorId")
    List<Video> findByInstructorId(Long instructorId);
}