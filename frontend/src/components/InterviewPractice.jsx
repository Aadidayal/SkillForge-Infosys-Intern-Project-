import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewPractice({ interviewId }) {
  const [interview, setInterview] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchInterview();
  }, [interviewId]);

  const fetchInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8080/api/interviews/${interviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInterview(response.data);
    } catch (error) {
      console.error('Error fetching interview:', error);
    }
  };

  const startInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/interviews/${interviewId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAttemptId(response.data.id);
    } catch (error) {
      console.error('Error starting interview:', error);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert('Please provide an answer');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/interviews/attempts/${attemptId}/answer`,
        {
          questionId: interview.questions[currentQuestionIndex].id,
          answer
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvaluation(response.data.evaluation);
      setLoading(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
      setLoading(false);
      alert('Error getting AI evaluation');
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer('');
      setEvaluation(null);
    } else {
      completeInterview();
    }
  };

  const completeInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/interviews/attempts/${attemptId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompleted(true);
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  if (!interview) {
    return <div className="text-center py-12">Loading interview...</div>;
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Interview Completed!</h2>
          <p className="text-gray-600 mb-6">
            Great job! Your answers have been evaluated by AI.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            View Results
          </button>
        </div>
      </motion.div>
    );
  }

  if (!attemptId) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{interview.title}</h2>
            <p className="text-gray-600">{interview.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-2xl font-bold text-blue-600">{interview.questions.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Difficulty</p>
              <p className="text-2xl font-bold text-purple-600">{interview.difficulty}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Job Role</p>
              <p className="text-lg font-bold text-green-600">{interview.jobRole}</p>
            </div>
          </div>

          <button
            onClick={startInterview}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all text-lg"
          >
            Start Interview Practice
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentQuestionIndex + 1} of {interview.questions.length}
          </span>
          <span className="text-sm font-medium text-indigo-600">{interview.difficulty}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestionIndex + 1) / interview.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 flex-1">
                {currentQuestion.question}
              </h3>
            </div>
          </div>

          {!evaluation ? (
            <>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here... Be detailed and demonstrate your knowledge."
                rows="10"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none mb-4"
              />

              <button
                onClick={submitAnswer}
                disabled={loading || !answer.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI is evaluating your answer...
                  </>
                ) : (
                  'Submit Answer for AI Evaluation'
                )}
              </button>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl font-bold text-green-600">{evaluation.score}/100</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full"
                        style={{ width: `${evaluation.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700">{evaluation.feedback}</p>
              </div>

              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">💪 Strengths</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {evaluation.strengths.map((strength, idx) => (
                      <li key={idx} className="text-green-700">{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {evaluation.improvements && evaluation.improvements.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">📈 Areas to Improve</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {evaluation.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-yellow-700">{improvement}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={nextQuestion}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                {currentQuestionIndex < interview.questions.length - 1 ? 'Next Question →' : 'Complete Interview'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
