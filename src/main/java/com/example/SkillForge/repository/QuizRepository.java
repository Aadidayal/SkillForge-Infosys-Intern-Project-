package com.example.SkillForge.repository;

import com.example.SkillForge.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    Optional<Quiz> findByModuleContentId(Long moduleContentId);
    
    @Query("SELECT q FROM Quiz q WHERE q.moduleContent.courseModule.course.instructor.id = :instructorId")
    List<Quiz> findByInstructorId(@Param("instructorId") Long instructorId);
    
    @Query("SELECT q FROM Quiz q WHERE q.moduleContent.courseModule.course.id = :courseId AND q.isPublished = true")
    List<Quiz> findPublishedQuizzesByCourseId(@Param("courseId") Long courseId);
}