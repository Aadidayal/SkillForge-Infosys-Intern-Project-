package com.example.SkillForge.dto;

import com.example.SkillForge.enums.MaterialType;
import com.example.SkillForge.enums.SkillLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningMaterialDto {
    private Long id;
    private Long topicId;
    private String title;
    private String description;
    private MaterialType materialType;
    private String contentUrl;
    private String videoUrl;
    private String pdfUrl;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private Long fileSize;
    private Integer orderIndex;
    private SkillLevel difficultyLevel;
    private List<String> tags;
    private Boolean isPublished;
    private Boolean isFree;
}
