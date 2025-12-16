package com.example.SkillForge.service;

import com.example.SkillForge.dto.TopicDto;
import com.example.SkillForge.entity.Course;
import com.example.SkillForge.entity.Topic;
import com.example.SkillForge.repository.CourseRepository;
import com.example.SkillForge.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicService {
    
    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;
    
    @Transactional
    public TopicDto createTopic(Long courseId, TopicDto topicDto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        // Get the next order index
        int orderIndex = topicRepository.findFirstByCourseIdOrderByOrderIndexDesc(courseId)
                .map(t -> t.getOrderIndex() + 1)
                .orElse(0);
        
        Topic topic = Topic.builder()
                .course(course)
                .title(topicDto.getTitle())
                .description(topicDto.getDescription())
                .orderIndex(orderIndex)
                .isPublished(false)
                .build();
        
        Topic savedTopic = topicRepository.save(topic);
        return convertToDto(savedTopic);
    }
    
    public List<TopicDto> getAllTopicsForCourse(Long courseId) {
        return topicRepository.findByCourseIdOrderByOrderIndexAsc(courseId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public TopicDto getTopicById(Long topicId) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));
        return convertToDto(topic);
    }
    
    @Transactional
    public TopicDto updateTopic(Long topicId, TopicDto topicDto) {
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new RuntimeException("Topic not found with id: " + topicId));
        
        topic.setTitle(topicDto.getTitle());
        topic.setDescription(topicDto.getDescription());
        if (topicDto.getIsPublished() != null) {
            topic.setIsPublished(topicDto.getIsPublished());
        }
        
        Topic updatedTopic = topicRepository.save(topic);
        return convertToDto(updatedTopic);
    }
    
    @Transactional
    public void deleteTopic(Long topicId) {
        topicRepository.deleteById(topicId);
    }
    
    private TopicDto convertToDto(Topic topic) {
        return TopicDto.builder()
                .id(topic.getId())
                .courseId(topic.getCourse().getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .orderIndex(topic.getOrderIndex())
                .isPublished(topic.getIsPublished())
                .build();
    }
}
