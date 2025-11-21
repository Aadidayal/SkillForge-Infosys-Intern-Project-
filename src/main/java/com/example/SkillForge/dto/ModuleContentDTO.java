package com.example.SkillForge.dto;

import com.example.SkillForge.enums.ContentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModuleContentDTO {
    private Long id;
    private String title;
    private String description;
    private ContentType contentType;
    private Integer contentOrder;
    private String contentUrl;
    private String videoUrl;
    private String pdfUrl;
    private String thumbnailUrl;
    private Integer durationSeconds;
    private Long fileSize;
    private Boolean isPublished;
    private Boolean isFree;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}