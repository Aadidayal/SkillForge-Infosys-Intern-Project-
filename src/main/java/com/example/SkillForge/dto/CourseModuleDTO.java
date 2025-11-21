package com.example.SkillForge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseModuleDTO {
    private Long id;
    private String title;
    private String description;
    private Integer moduleOrder;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ModuleContentDTO> moduleContents;
    private Long totalContent;
    private Long publishedContent;
}