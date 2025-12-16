package com.example.SkillForge.service;

import com.example.SkillForge.dto.LearningMaterialDto;
import com.example.SkillForge.entity.LearningMaterial;
import com.example.SkillForge.entity.Topic;
import com.example.SkillForge.repository.LearningMaterialRepository;
import com.example.SkillForge.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningMaterialService {
    
    private final LearningMaterialRepository learningMaterialRepository;
    private final TopicRepository topicRepository;
    
    @Transactional
    public LearningMaterialDto createLearningMaterial(Long topicId, LearningMaterialDto materialDto) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));
        
        // Get the next order index
        int orderIndex = learningMaterialRepository.findFirstByTopicIdOrderByOrderIndexDesc(topicId)
                .map(m -> m.getOrderIndex() + 1)
                .orElse(0);
        
        LearningMaterial material = LearningMaterial.builder()
                .topic(topic)
                .title(materialDto.getTitle())
                .description(materialDto.getDescription())
                .materialType(materialDto.getMaterialType())
                .contentUrl(materialDto.getContentUrl())
                .videoUrl(materialDto.getVideoUrl())
                .pdfUrl(materialDto.getPdfUrl())
                .thumbnailUrl(materialDto.getThumbnailUrl())
                .durationSeconds(materialDto.getDurationSeconds())
                .fileSize(materialDto.getFileSize())
                .orderIndex(orderIndex)
                .isPublished(false)
                .isFree(materialDto.getIsFree() != null ? materialDto.getIsFree() : false)
                .build();
        
        LearningMaterial savedMaterial = learningMaterialRepository.save(material);
        return convertToDto(savedMaterial);
    }
    
    public List<LearningMaterialDto> getAllMaterialsForTopic(Long topicId) {
        return learningMaterialRepository.findByTopicIdOrderByOrderIndexAsc(topicId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public LearningMaterialDto getMaterialById(Long materialId) {
        LearningMaterial material = learningMaterialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Learning material not found with id: " + materialId));
        return convertToDto(material);
    }
    
    @Transactional
    public LearningMaterialDto updateLearningMaterial(Long materialId, LearningMaterialDto materialDto) {
        LearningMaterial material = learningMaterialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Learning material not found with id: " + materialId));
        
        material.setTitle(materialDto.getTitle());
        material.setDescription(materialDto.getDescription());
        material.setMaterialType(materialDto.getMaterialType());
        material.setContentUrl(materialDto.getContentUrl());
        material.setVideoUrl(materialDto.getVideoUrl());
        material.setPdfUrl(materialDto.getPdfUrl());
        material.setThumbnailUrl(materialDto.getThumbnailUrl());
        material.setDurationSeconds(materialDto.getDurationSeconds());
        material.setFileSize(materialDto.getFileSize());
        if (materialDto.getIsPublished() != null) {
            material.setIsPublished(materialDto.getIsPublished());
        }
        if (materialDto.getIsFree() != null) {
            material.setIsFree(materialDto.getIsFree());
        }
        
        LearningMaterial updatedMaterial = learningMaterialRepository.save(material);
        return convertToDto(updatedMaterial);
    }
    
    @Transactional
    public void deleteLearningMaterial(Long materialId) {
        learningMaterialRepository.deleteById(materialId);
    }
    
    private LearningMaterialDto convertToDto(LearningMaterial material) {
        return LearningMaterialDto.builder()
                .id(material.getId())
                .topicId(material.getTopic().getId())
                .title(material.getTitle())
                .description(material.getDescription())
                .materialType(material.getMaterialType())
                .contentUrl(material.getContentUrl())
                .videoUrl(material.getVideoUrl())
                .pdfUrl(material.getPdfUrl())
                .thumbnailUrl(material.getThumbnailUrl())
                .durationSeconds(material.getDurationSeconds())
                .fileSize(material.getFileSize())
                .orderIndex(material.getOrderIndex())
                .isPublished(material.getIsPublished())
                .isFree(material.getIsFree())
                .build();
    }
}
