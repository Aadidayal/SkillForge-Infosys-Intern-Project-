package com.example.SkillForge.repository;

import com.example.SkillForge.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByCourseIdAndIsPublished(Long courseId, Boolean isPublished);
    List<Interview> findByCourseId(Long courseId);
}
