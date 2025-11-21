package com.example.SkillForge.repository;

import com.example.SkillForge.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, Long> {
    
    List<StudentAnswer> findByAttemptId(Long attemptId);
    
    Optional<StudentAnswer> findByAttemptIdAndQuestionId(Long attemptId, Long questionId);
    
    @Query("SELECT COUNT(sa) FROM StudentAnswer sa WHERE sa.attempt.id = :attemptId AND sa.isCorrect = true")
    Long countCorrectAnswersByAttemptId(@Param("attemptId") Long attemptId);
    
    @Query("SELECT SUM(sa.pointsEarned) FROM StudentAnswer sa WHERE sa.attempt.id = :attemptId")
    Integer sumPointsEarnedByAttemptId(@Param("attemptId") Long attemptId);
}