package com.example.SkillForge.repository;

import com.example.SkillForge.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {
    
    List<Topic> findByCourseIdOrderByOrderIndexAsc(Long courseId);
    
    List<Topic> findByCourseIdAndIsPublishedTrueOrderByOrderIndexAsc(Long courseId);
    
    Long countByCourseId(Long courseId);
}
