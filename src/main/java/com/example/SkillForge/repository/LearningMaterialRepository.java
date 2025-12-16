package com.example.SkillForge.repository;

import com.example.SkillForge.entity.LearningMaterial;
import com.example.SkillForge.enums.MaterialType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningMaterialRepository extends JpaRepository<LearningMaterial, Long> {
    
    List<LearningMaterial> findByTopicIdOrderByOrderIndexAsc(Long topicId);
    
    List<LearningMaterial> findByTopicIdAndIsPublishedTrueOrderByOrderIndexAsc(Long topicId);
    
    List<LearningMaterial> findByMaterialType(MaterialType materialType);
    
    @Query("SELECT lm FROM LearningMaterial lm WHERE lm.topic.course.id = :courseId ORDER BY lm.topic.orderIndex, lm.orderIndex")
    List<LearningMaterial> findAllByCourseIdOrderByTopic(Long courseId);
    
    Long countByTopicId(Long topicId);
}
