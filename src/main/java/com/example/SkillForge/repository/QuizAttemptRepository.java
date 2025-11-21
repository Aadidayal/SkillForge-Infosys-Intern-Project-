package com.example.SkillForge.repository;

import com.example.SkillForge.entity.QuizAttempt;
import com.example.SkillForge.enums.AttemptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    
    List<QuizAttempt> findByQuizIdAndStudentIdOrderByAttemptNumberDesc(Long quizId, Long studentId);
    
    Optional<QuizAttempt> findByQuizIdAndStudentIdAndStatus(Long quizId, Long studentId, AttemptStatus status);
    
    @Query("SELECT COUNT(qa) FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.student.id = :studentId")
    Long countAttemptsByQuizAndStudent(@Param("quizId") Long quizId, @Param("studentId") Long studentId);
    
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.student.id = :studentId AND qa.status = 'COMPLETED' AND qa.passed = true ORDER BY qa.completedAt DESC")
    List<QuizAttempt> findPassedAttempts(@Param("quizId") Long quizId, @Param("studentId") Long studentId);
    
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.student.id = :studentId ORDER BY qa.startedAt DESC")
    List<QuizAttempt> findByStudentIdOrderByStartedAtDesc(@Param("studentId") Long studentId);
}