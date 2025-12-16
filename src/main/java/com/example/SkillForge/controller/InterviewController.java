package com.example.SkillForge.controller;

import com.example.SkillForge.entity.*;
import com.example.SkillForge.repository.*;
import com.example.SkillForge.service.GeminiAIService;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
@Slf4j
public class InterviewController {
    
    private final InterviewRepository interviewRepository;
    private final InterviewAttemptRepository interviewAttemptRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;
    private final CourseRepository courseRepository;
    private final GeminiAIService geminiAIService;
    private final Gson gson = new Gson();
    
    /**
     * Generate interview questions using AI (Instructor only)
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> generateInterview(
            @AuthenticationPrincipal User instructor,
            @RequestBody Map<String, Object> request) {
        try {
            Long courseId = ((Number) request.get("courseId")).longValue();
            String jobRole = (String) request.get("jobRole");
            String difficulty = (String) request.get("difficulty");
            int numberOfQuestions = ((Number) request.get("numberOfQuestions")).intValue();
            
            Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
            
            // Verify instructor owns the course
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body("You can only generate interviews for your own courses");
            }
            
            // Generate interview using AI
            String aiResponse = geminiAIService.generateInterviewQuestions(
                course.getTitle(), jobRole, difficulty, numberOfQuestions
            );
            
            // Parse AI response
            JsonArray questions = gson.fromJson(aiResponse, JsonArray.class);
            
            // Create interview
            Interview interview = Interview.builder()
                .course(course)
                .title(jobRole + " Interview Prep")
                .description("AI-generated interview questions for " + jobRole + " role")
                .jobRole(jobRole)
                .difficulty(difficulty)
                .timeLimitMinutes(60)
                .isPublished(false)
                .aiGenerated(true)
                .build();
            
            Interview savedInterview = interviewRepository.save(interview);
            
            // Save questions
            List<InterviewQuestion> savedQuestions = new ArrayList<>();
            for (int i = 0; i < questions.size(); i++) {
                JsonObject q = questions.get(i).getAsJsonObject();
                
                InterviewQuestion question = InterviewQuestion.builder()
                    .interview(savedInterview)
                    .question(q.get("question").getAsString())
                    .sampleAnswer(q.get("sampleAnswer").getAsString())
                    .keyPoints(q.get("keyPoints").toString())
                    .difficulty(q.get("difficulty").getAsString())
                    .orderIndex(i)
                    .build();
                
                savedQuestions.add(question);
            }
            
            savedInterview.setQuestions(savedQuestions);
            interviewRepository.save(savedInterview);
            
            Map<String, Object> response = new HashMap<>();
            response.put("interview", savedInterview);
            response.put("message", "Interview generated successfully! Review and publish when ready.");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating interview", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Get all interviews for a course
     */
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseInterviews(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user) {
        
        List<Interview> interviews;
        if (user != null && user.getRole().toString().equals("INSTRUCTOR")) {
            interviews = interviewRepository.findByCourseId(courseId);
        } else {
            interviews = interviewRepository.findByCourseIdAndIsPublished(courseId, true);
        }
        
        return ResponseEntity.ok(interviews);
    }
    
    /**
     * Get interview by ID
     */
    @GetMapping("/{interviewId}")
    public ResponseEntity<?> getInterview(@PathVariable Long interviewId) {
        Interview interview = interviewRepository.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        return ResponseEntity.ok(interview);
    }
    
    /**
     * Start interview attempt
     */
    @PostMapping("/{interviewId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> startInterview(
            @PathVariable Long interviewId,
            @AuthenticationPrincipal User student) {
        
        Interview interview = interviewRepository.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        InterviewAttempt attempt = InterviewAttempt.builder()
            .interview(interview)
            .student(student)
            .totalQuestions(interview.getQuestions().size())
            .startedAt(LocalDateTime.now())
            .build();
        
        InterviewAttempt savedAttempt = interviewAttemptRepository.save(attempt);
        
        return ResponseEntity.ok(savedAttempt);
    }
    
    /**
     * Submit answer to interview question (with AI evaluation)
     */
    @PostMapping("/attempts/{attemptId}/answer")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAnswer(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal User student,
            @RequestBody Map<String, Object> request) {
        
        try {
            InterviewAttempt attempt = interviewAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Interview attempt not found"));
            
            if (!attempt.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(403).body("Unauthorized");
            }
            
            Long questionId = ((Number) request.get("questionId")).longValue();
            String studentAnswer = (String) request.get("answer");
            
            InterviewQuestion question = attempt.getInterview().getQuestions().stream()
                .filter(q -> q.getId().equals(questionId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Question not found"));
            
            // Evaluate answer using AI
            String aiEvaluation = geminiAIService.evaluateInterviewAnswer(
                question.getQuestion(),
                studentAnswer,
                question.getSampleAnswer()
            );
            
            JsonObject evaluation = gson.fromJson(aiEvaluation, JsonObject.class);
            
            // Save answer with AI feedback
            InterviewAnswer answer = InterviewAnswer.builder()
                .attempt(attempt)
                .question(question)
                .studentAnswer(studentAnswer)
                .aiScore(evaluation.get("score").getAsInt())
                .aiFeedback(evaluation.get("feedback").getAsString())
                .strengths(evaluation.get("strengths").toString())
                .improvements(evaluation.get("improvements").toString())
                .build();
            
            interviewAnswerRepository.save(answer);
            
            Map<String, Object> response = new HashMap<>();
            response.put("evaluation", evaluation);
            response.put("message", "Answer submitted and evaluated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error evaluating answer", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Complete interview attempt
     */
    @PostMapping("/attempts/{attemptId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> completeInterview(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal User student) {
        
        InterviewAttempt attempt = interviewAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Interview attempt not found"));
        
        if (!attempt.getStudent().getId().equals(student.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        
        // Calculate overall score from all answers
        List<InterviewAnswer> answers = interviewAnswerRepository.findByAttemptId(attemptId);
        
        if (!answers.isEmpty()) {
            int totalScore = answers.stream()
                .mapToInt(InterviewAnswer::getAiScore)
                .sum();
            int overallScore = totalScore / answers.size();
            
            attempt.setOverallScore(overallScore);
        }
        
        attempt.setCompletedAt(LocalDateTime.now());
        interviewAttemptRepository.save(attempt);
        
        Map<String, Object> response = new HashMap<>();
        response.put("overallScore", attempt.getOverallScore());
        response.put("totalQuestions", attempt.getTotalQuestions());
        response.put("answersSubmitted", answers.size());
        response.put("message", "Interview completed successfully!");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get student's interview attempts
     */
    @GetMapping("/my-attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyAttempts(@AuthenticationPrincipal User student) {
        List<InterviewAttempt> attempts = interviewAttemptRepository.findByStudentId(student.getId());
        return ResponseEntity.ok(attempts);
    }
    
    /**
     * Get interview attempt details with all answers
     */
    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<?> getAttemptDetails(
            @PathVariable Long attemptId,
            @AuthenticationPrincipal User user) {
        
        InterviewAttempt attempt = interviewAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Interview attempt not found"));
        
        // Verify access
        if (!attempt.getStudent().getId().equals(user.getId()) &&
            !attempt.getInterview().getCourse().getInstructor().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        
        List<InterviewAnswer> answers = interviewAnswerRepository.findByAttemptId(attemptId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("attempt", attempt);
        response.put("answers", answers);
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Publish interview (Instructor only)
     */
    @PutMapping("/{interviewId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> publishInterview(
            @PathVariable Long interviewId,
            @AuthenticationPrincipal User instructor) {
        
        Interview interview = interviewRepository.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        if (!interview.getCourse().getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        
        interview.setIsPublished(true);
        interviewRepository.save(interview);
        
        return ResponseEntity.ok("Interview published successfully");
    }
    
    /**
     * Delete interview (Instructor only)
     */
    @DeleteMapping("/{interviewId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> deleteInterview(
            @PathVariable Long interviewId,
            @AuthenticationPrincipal User instructor) {
        
        Interview interview = interviewRepository.findById(interviewId)
            .orElseThrow(() -> new RuntimeException("Interview not found"));
        
        if (!interview.getCourse().getInstructor().getId().equals(instructor.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        
        interviewRepository.delete(interview);
        return ResponseEntity.ok("Interview deleted successfully");
    }
}
