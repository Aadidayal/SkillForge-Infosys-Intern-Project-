package com.example.SkillForge.controller;

import com.example.SkillForge.entity.CourseModule;
import com.example.SkillForge.entity.ModuleContent;
import com.example.SkillForge.entity.User;
import com.example.SkillForge.enums.ContentType;
import com.example.SkillForge.repository.CourseModuleRepository;
import com.example.SkillForge.repository.ModuleContentRepository;
import com.example.SkillForge.service.CloudinaryVideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/modules/{moduleId}/content")
@CrossOrigin(origins = "http://localhost:5173")
public class ModuleContentController {

    @Autowired
    private ModuleContentRepository moduleContentRepository;

    @Autowired
    private CourseModuleRepository courseModuleRepository;

    @Autowired
    private CloudinaryVideoService cloudinaryVideoService;

    // Get all content for a module (public for enrolled students)
    @GetMapping
    public ResponseEntity<?> getModuleContent(@PathVariable Long moduleId) {
        try {
            List<ModuleContent> content = moduleContentRepository.findByCourseModuleIdOrderByContentOrderAsc(moduleId);
            return ResponseEntity.ok(Map.of("content", content));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch content: " + e.getMessage()));
        }
    }

    // Get all content for instructor (including unpublished)
    @GetMapping("/manage")
    public ResponseEntity<?> getContentForInstructor(@PathVariable Long moduleId, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify module belongs to instructor
            Optional<CourseModule> moduleOpt = courseModuleRepository.findById(moduleId);
            if (moduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseModule module = moduleOpt.get();
            if (!module.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            List<ModuleContent> content = moduleContentRepository.findByCourseModuleIdOrderByContentOrderAsc(moduleId);
            return ResponseEntity.ok(Map.of("content", content));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch content: " + e.getMessage()));
        }
    }

    // Upload video content
    @PostMapping("/video")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> uploadVideoContent(@PathVariable Long moduleId,
                                              @RequestParam("file") MultipartFile file,
                                              @RequestParam("title") String title,
                                              @RequestParam("description") String description,
                                              @RequestParam(value = "isFree", defaultValue = "false") boolean isFree,
                                              Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify module belongs to instructor
            Optional<CourseModule> moduleOpt = courseModuleRepository.findById(moduleId);
            if (moduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseModule module = moduleOpt.get();
            if (!module.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Upload video to Cloudinary
            Map<String, Object> uploadResult = cloudinaryVideoService.uploadVideo(file);
            
            // Create module content
            ModuleContent content = new ModuleContent();
            content.setTitle(title);
            content.setDescription(description);
            content.setCourseModule(module);
            content.setContentType(ContentType.VIDEO);
            content.setVideoUrl((String) uploadResult.get("secure_url"));
            content.setThumbnailUrl((String) uploadResult.get("thumbnail_url"));
            
            // Handle duration - Cloudinary returns Double, convert to Integer
            Object durationObj = uploadResult.get("duration");
            if (durationObj instanceof Double) {
                content.setDurationSeconds(((Double) durationObj).intValue());
            } else if (durationObj instanceof Integer) {
                content.setDurationSeconds((Integer) durationObj);
            } else if (durationObj != null) {
                content.setDurationSeconds(Double.valueOf(durationObj.toString()).intValue());
            }
            
            content.setFileSize(file.getSize());
            content.setIsFree(isFree);
            content.setIsPublished(false); // Default to unpublished
            
            // Auto-assign next order
            Integer maxOrder = moduleContentRepository.findMaxContentOrderByModuleId(moduleId);
            content.setContentOrder(maxOrder != null ? maxOrder + 1 : 1);

            ModuleContent savedContent = moduleContentRepository.save(content);
            return ResponseEntity.ok(Map.of("content", savedContent, "message", "Video uploaded successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload video: " + e.getMessage()));
        }
    }

    // Upload PDF content (notes or questions)
    @PostMapping("/pdf")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> uploadPdfContent(@PathVariable Long moduleId,
                                            @RequestParam("file") MultipartFile file,
                                            @RequestParam("title") String title,
                                            @RequestParam("description") String description,
                                            @RequestParam("contentType") String contentTypeStr,
                                            @RequestParam(value = "isFree", defaultValue = "false") boolean isFree,
                                            Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify module belongs to instructor
            Optional<CourseModule> moduleOpt = courseModuleRepository.findById(moduleId);
            if (moduleOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourseModule module = moduleOpt.get();
            if (!module.getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Validate content type
            ContentType contentType;
            try {
                contentType = ContentType.valueOf(contentTypeStr.toUpperCase());
                if (contentType != ContentType.PDF_NOTES && contentType != ContentType.PDF_QUESTIONS) {
                    throw new IllegalArgumentException("Invalid content type for PDF upload");
                }
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid content type: " + contentTypeStr));
            }

            // Validate file type
            String contentTypeHeader = file.getContentType();
            if (contentTypeHeader == null || !contentTypeHeader.equals("application/pdf")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are allowed"));
            }

            // Upload PDF to Cloudinary (as raw file)
            Map<String, Object> uploadResult = cloudinaryVideoService.uploadPdf(file);
            
            // Create module content
            ModuleContent content = new ModuleContent();
            content.setTitle(title);
            content.setDescription(description);
            content.setCourseModule(module);
            content.setContentType(contentType);
            content.setPdfUrl((String) uploadResult.get("secure_url"));
            content.setFileSize(file.getSize());
            content.setIsFree(isFree);
            content.setIsPublished(false); // Default to unpublished
            
            // Auto-assign next order
            Integer maxOrder = moduleContentRepository.findMaxContentOrderByModuleId(moduleId);
            content.setContentOrder(maxOrder != null ? maxOrder + 1 : 1);

            ModuleContent savedContent = moduleContentRepository.save(content);
            return ResponseEntity.ok(Map.of("content", savedContent, "message", "PDF uploaded successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to upload PDF: " + e.getMessage()));
        }
    }

    // Update content
    @PutMapping("/{contentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> updateContent(@PathVariable Long moduleId, @PathVariable Long contentId,
                                         @RequestBody ModuleContent contentData, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Find existing content
            Optional<ModuleContent> contentOpt = moduleContentRepository.findById(contentId);
            if (contentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ModuleContent existingContent = contentOpt.get();
            
            // Verify belongs to instructor
            if (!existingContent.getCourseModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Update fields
            existingContent.setTitle(contentData.getTitle());
            existingContent.setDescription(contentData.getDescription());
            if (contentData.getContentOrder() != null) {
                existingContent.setContentOrder(contentData.getContentOrder());
            }
            if (contentData.getIsPublished() != null) {
                existingContent.setIsPublished(contentData.getIsPublished());
            }
            if (contentData.getIsFree() != null) {
                existingContent.setIsFree(contentData.getIsFree());
            }

            ModuleContent savedContent = moduleContentRepository.save(existingContent);
            return ResponseEntity.ok(Map.of("content", savedContent, "message", "Content updated successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update content: " + e.getMessage()));
        }
    }

    // Delete content
    @DeleteMapping("/{contentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteContent(@PathVariable Long moduleId, @PathVariable Long contentId, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Find existing content
            Optional<ModuleContent> contentOpt = moduleContentRepository.findById(contentId);
            if (contentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ModuleContent existingContent = contentOpt.get();
            
            // Verify belongs to instructor
            if (!existingContent.getCourseModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            moduleContentRepository.delete(existingContent);
            return ResponseEntity.ok(Map.of("message", "Content deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete content: " + e.getMessage()));
        }
    }

    // Publish/Unpublish content
    @PatchMapping("/{contentId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> publishContent(@PathVariable Long moduleId, @PathVariable Long contentId,
                                                @RequestParam boolean published, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Find existing content
            Optional<ModuleContent> contentOpt = moduleContentRepository.findById(contentId);
            if (contentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ModuleContent existingContent = contentOpt.get();
            
            // Verify belongs to instructor
            if (!existingContent.getCourseModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            existingContent.setIsPublished(published);
            ModuleContent savedContent = moduleContentRepository.save(existingContent);
            
            String action = published ? "published" : "unpublished";
            return ResponseEntity.ok(Map.of("content", savedContent, "message", "Content " + action + " successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update content: " + e.getMessage()));
        }
    }
}