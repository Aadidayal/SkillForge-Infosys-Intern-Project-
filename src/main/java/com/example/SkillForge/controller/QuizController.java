package com.example.SkillForge.controller;

import com.example.SkillForge.entity.*;
import com.example.SkillForge.enums.AttemptStatus;
import com.example.SkillForge.enums.ContentType;
import com.example.SkillForge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizQuestionRepository questionRepository;

    @Autowired
    private QuestionOptionRepository optionRepository;

    @Autowired
    private QuizAttemptRepository attemptRepository;

    @Autowired
    private StudentAnswerRepository answerRepository;

    @Autowired
    private ModuleContentRepository moduleContentRepository;



    // Create quiz for module content
    @PostMapping("/content/{contentId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> createQuiz(@PathVariable Long contentId, @RequestBody Quiz quizData, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify module content exists and belongs to instructor
            Optional<ModuleContent> contentOpt = moduleContentRepository.findById(contentId);
            if (contentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            ModuleContent content = contentOpt.get();
            if (!content.getCourseModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Verify content type is QUIZ
            if (content.getContentType() != ContentType.QUIZ) {
                return ResponseEntity.badRequest().body(Map.of("error", "Content type must be QUIZ"));
            }

            // Check if quiz already exists for this content
            if (quizRepository.findByModuleContentId(contentId).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quiz already exists for this content"));
            }

            // Create quiz
            Quiz quiz = new Quiz();
            quiz.setTitle(quizData.getTitle());
            quiz.setDescription(quizData.getDescription());
            quiz.setModuleContent(content);
            quiz.setPassingScore(quizData.getPassingScore() != null ? quizData.getPassingScore() : 70);
            quiz.setTimeLimitMinutes(quizData.getTimeLimitMinutes());
            quiz.setMaxAttempts(quizData.getMaxAttempts() != null ? quizData.getMaxAttempts() : 3);
            quiz.setShowResultsImmediately(quizData.getShowResultsImmediately() != null ? quizData.getShowResultsImmediately() : true);
            quiz.setIsPublished(false);

            Quiz savedQuiz = quizRepository.save(quiz);
            return ResponseEntity.ok(Map.of("quiz", savedQuiz, "message", "Quiz created successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create quiz: " + e.getMessage()));
        }
    }

    // Get quiz by content ID
    @GetMapping("/content/{contentId}")
    public ResponseEntity<?> getQuizByContent(@PathVariable Long contentId) {
        try {
            Optional<Quiz> quizOpt = quizRepository.findByModuleContentId(contentId);
            if (quizOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Quiz quiz = quizOpt.get();
            // All quizzes are now accessible - no published check needed

            return ResponseEntity.ok(Map.of("quiz", quiz));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch quiz: " + e.getMessage()));
        }
    }

    // Add question to quiz
    @PostMapping("/{quizId}/questions")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> addQuestion(@PathVariable Long quizId, @RequestBody QuizQuestion questionData, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify quiz belongs to instructor
            Optional<Quiz> quizOpt = quizRepository.findById(quizId);
            if (quizOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Quiz quiz = quizOpt.get();
            if (!quiz.getModuleContent().getCourseModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Create question
            QuizQuestion question = new QuizQuestion();
            question.setQuiz(quiz);
            question.setQuestionText(questionData.getQuestionText());
            question.setQuestionType(questionData.getQuestionType());
            question.setPoints(questionData.getPoints() != null ? questionData.getPoints() : 1);
            question.setExplanation(questionData.getExplanation());
            
            // Auto-assign next order
            Integer maxOrder = questionRepository.findMaxQuestionOrderByQuizId(quizId);
            question.setQuestionOrder(maxOrder != null ? maxOrder + 1 : 1);

            QuizQuestion savedQuestion = questionRepository.save(question);
            return ResponseEntity.ok(Map.of("question", savedQuestion, "message", "Question added successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add question: " + e.getMessage()));
        }
    }

    // Add option to question
    @PostMapping("/questions/{questionId}/options")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> addOption(@PathVariable Long questionId, @RequestBody QuestionOption optionData, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify question belongs to instructor
            Optional<QuizQuestion> questionOpt = questionRepository.findById(questionId);
            if (questionOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            QuizQuestion question = questionOpt.get();
            if (!question.getQuiz().getModuleContent().getCourseModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            // Create option
            QuestionOption option = new QuestionOption();
            option.setQuestion(question);
            option.setOptionText(optionData.getOptionText());
            option.setIsCorrect(optionData.getIsCorrect() != null ? optionData.getIsCorrect() : false);
            
            // Auto-assign next order
            Integer maxOrder = optionRepository.findMaxOptionOrderByQuestionId(questionId);
            option.setOptionOrder(maxOrder != null ? maxOrder + 1 : 1);

            QuestionOption savedOption = optionRepository.save(option);
            return ResponseEntity.ok(Map.of("option", savedOption, "message", "Option added successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to add option: " + e.getMessage()));
        }
    }

    // Start quiz attempt
    @PostMapping("/{quizId}/attempts")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> startQuizAttempt(@PathVariable Long quizId, Authentication auth) {
        try {
            User student = (User) auth.getPrincipal();
            
            // Verify quiz exists and is published
            Optional<Quiz> quizOpt = quizRepository.findById(quizId);
            if (quizOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Quiz quiz = quizOpt.get();
            // All quizzes are now accessible - no published check needed

            // Check if student has reached max attempts
            Long attemptCount = attemptRepository.countAttemptsByQuizAndStudent(quizId, student.getId());
            if (attemptCount >= quiz.getMaxAttempts()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Maximum attempts reached"));
            }

            // Check if student has an in-progress attempt
            Optional<QuizAttempt> inProgressAttempt = attemptRepository.findByQuizIdAndStudentIdAndStatus(quizId, student.getId(), AttemptStatus.IN_PROGRESS);
            if (inProgressAttempt.isPresent()) {
                return ResponseEntity.ok(Map.of("attempt", inProgressAttempt.get(), "message", "Resume existing attempt"));
            }

            // Create new attempt
            QuizAttempt attempt = new QuizAttempt();
            attempt.setQuiz(quiz);
            attempt.setStudent(student);
            attempt.setAttemptNumber(attemptCount.intValue() + 1);
            attempt.setStatus(AttemptStatus.IN_PROGRESS);
            attempt.setStartedAt(LocalDateTime.now());

            QuizAttempt savedAttempt = attemptRepository.save(attempt);
            return ResponseEntity.ok(Map.of("attempt", savedAttempt, "message", "Quiz attempt started"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to start quiz: " + e.getMessage()));
        }
    }

    // Submit answer
    @PostMapping("/attempts/{attemptId}/answers")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAnswer(@PathVariable Long attemptId, @RequestBody Map<String, Object> answerData, Authentication auth) {
        try {
            User student = (User) auth.getPrincipal();
            
            // Verify attempt belongs to student
            Optional<QuizAttempt> attemptOpt = attemptRepository.findById(attemptId);
            if (attemptOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            QuizAttempt attempt = attemptOpt.get();
            if (!attempt.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
                return ResponseEntity.badRequest().body(Map.of("error", "Attempt is not in progress"));
            }

            Long questionId = Long.valueOf(answerData.get("questionId").toString());
            Long selectedOptionId = Long.valueOf(answerData.get("selectedOptionId").toString());

            // Verify question and option exist
            Optional<QuizQuestion> questionOpt = questionRepository.findById(questionId);
            Optional<QuestionOption> optionOpt = optionRepository.findById(selectedOptionId);
            
            if (questionOpt.isEmpty() || optionOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid question or option"));
            }

            QuizQuestion question = questionOpt.get();
            QuestionOption selectedOption = optionOpt.get();

            // Check if answer already exists (update if so)
            Optional<StudentAnswer> existingAnswer = answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId);
            
            StudentAnswer answer;
            if (existingAnswer.isPresent()) {
                answer = existingAnswer.get();
            } else {
                answer = new StudentAnswer();
                answer.setAttempt(attempt);
                answer.setQuestion(question);
            }
            
            answer.setSelectedOption(selectedOption);
            answer.setIsCorrect(selectedOption.getIsCorrect());
            answer.setPointsEarned(selectedOption.getIsCorrect() ? question.getPoints() : 0);

            StudentAnswer savedAnswer = answerRepository.save(answer);
            return ResponseEntity.ok(Map.of("answer", savedAnswer, "message", "Answer submitted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to submit answer: " + e.getMessage()));
        }
    }

    // Complete quiz attempt
    @PostMapping("/attempts/{attemptId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> completeAttempt(@PathVariable Long attemptId, Authentication auth) {
        try {
            User student = (User) auth.getPrincipal();
            
            // Verify attempt belongs to student
            Optional<QuizAttempt> attemptOpt = attemptRepository.findById(attemptId);
            if (attemptOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            QuizAttempt attempt = attemptOpt.get();
            if (!attempt.getStudent().getId().equals(student.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
                return ResponseEntity.badRequest().body(Map.of("error", "Attempt is not in progress"));
            }

            // Calculate score
            Integer totalPoints = questionRepository.sumPointsByQuizId(attempt.getQuiz().getId());
            Integer earnedPoints = answerRepository.sumPointsEarnedByAttemptId(attemptId);
            
            if (totalPoints == null) totalPoints = 0;
            if (earnedPoints == null) earnedPoints = 0;
            
            Integer score = totalPoints > 0 ? (earnedPoints * 100) / totalPoints : 0;
            Boolean passed = score >= attempt.getQuiz().getPassingScore();

            // Calculate time spent
            long timeSpent = ChronoUnit.MINUTES.between(attempt.getStartedAt(), LocalDateTime.now());

            // Update attempt
            attempt.setStatus(AttemptStatus.COMPLETED);
            attempt.setCompletedAt(LocalDateTime.now());
            attempt.setTotalPoints(totalPoints);
            attempt.setEarnedPoints(earnedPoints);
            attempt.setScore(score);
            attempt.setPassed(passed);
            attempt.setTimeSpentMinutes((int) timeSpent);

            QuizAttempt savedAttempt = attemptRepository.save(attempt);
            
            Map<String, Object> result = Map.of(
                "attempt", savedAttempt,
                "score", score,
                "passed", passed,
                "totalPoints", totalPoints,
                "earnedPoints", earnedPoints,
                "message", passed ? "Congratulations! You passed the quiz." : "You did not pass. Try again!"
            );
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to complete quiz: " + e.getMessage()));
        }
    }

    // Get student's quiz attempts
    @GetMapping("/{quizId}/attempts/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getStudentAttempts(@PathVariable Long quizId, Authentication auth) {
        try {
            User student = (User) auth.getPrincipal();
            
            List<QuizAttempt> attempts = attemptRepository.findByQuizIdAndStudentIdOrderByAttemptNumberDesc(quizId, student.getId());
            return ResponseEntity.ok(Map.of("attempts", attempts));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch attempts: " + e.getMessage()));
        }
    }

    // Publish/Unpublish quiz (instructor only)
    @PatchMapping("/{quizId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> toggleQuizPublish(@PathVariable Long quizId, @RequestParam boolean published, Authentication auth) {
        try {
            User instructor = (User) auth.getPrincipal();
            
            // Verify quiz belongs to instructor
            Optional<Quiz> quizOpt = quizRepository.findById(quizId);
            if (quizOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Quiz quiz = quizOpt.get();
            if (!quiz.getModuleContent().getCourseModule().getCourse().getInstructor().getId().equals(instructor.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            quiz.setIsPublished(published);
            Quiz savedQuiz = quizRepository.save(quiz);
            
            String action = published ? "published" : "unpublished";
            return ResponseEntity.ok(Map.of("quiz", savedQuiz, "message", "Quiz " + action + " successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update quiz: " + e.getMessage()));
        }
    }
}