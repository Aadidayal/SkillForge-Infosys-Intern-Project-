package com.example.SkillForge.service;

import com.example.SkillForge.entity.Course;
import com.example.SkillForge.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseCleanupService implements ApplicationRunner {
    
    private final CourseRepository courseRepository;
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Clean up old placeholder URLs from existing courses
        cleanupPlaceholderUrls();
    }
    
    private void cleanupPlaceholderUrls() {
        try {
            List<Course> coursesWithPlaceholders = courseRepository.findAll()
                .stream()
                .filter(course -> course.getThumbnailUrl() != null && 
                                course.getThumbnailUrl().contains("placeholder.com"))
                .toList();
            
            if (!coursesWithPlaceholders.isEmpty()) {
                System.out.println("Cleaning up " + coursesWithPlaceholders.size() + " courses with old placeholder URLs...");
                
                for (Course course : coursesWithPlaceholders) {
                    course.setThumbnailUrl(null); // Let frontend handle placeholders
                }
                
                courseRepository.saveAll(coursesWithPlaceholders);
                System.out.println("Successfully cleaned up placeholder URLs from courses.");
            }
        } catch (Exception e) {
            System.err.println("Error cleaning up placeholder URLs: " + e.getMessage());
        }
    }
}