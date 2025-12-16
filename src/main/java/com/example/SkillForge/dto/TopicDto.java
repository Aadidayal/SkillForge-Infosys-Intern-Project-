package com.example.SkillForge.dto;

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
public class TopicDto {
    private Long id;
    private Long courseId;
    private String title;
    private String description;
    private Integer orderIndex;
    private SkillLevel difficultyLevel;
    private Integer estimatedDurationMinutes;
    private List<String> learningObjectives;
    private Boolean isPublished;
}
