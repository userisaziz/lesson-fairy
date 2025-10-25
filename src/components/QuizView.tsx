'use client';

import React, { useState, useEffect } from 'react';
import { LessonContent as LessonData, Question } from '@/types/lesson';

interface QuizViewProps {
  lesson: LessonData;
  onQuizComplete: (score: number, answers: {[key: number]: string}) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ lesson, onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [timeLeft, setTimeLeft] = useState(lesson.assessment.timeLimit * 60); // Convert minutes to seconds
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion: Question = lesson.assessment.questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerSelect = (optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionId
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < lesson.assessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    // Calculate score
    let correctAnswers = 0;
    
    lesson.assessment.questions.forEach(question => {
      const userAnswer = selectedAnswers[question.id];
      const correctOption = question.options.find(option => option.isCorrect);
      
      if (userAnswer && correctOption && userAnswer === correctOption.id) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / lesson.assessment.questions.length) * 100);
    onQuizComplete(score, selectedAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 mb-6 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.metadata.title} - Quiz</h1>
            <p className="text-gray-600">Test your knowledge</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-gray-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {currentQuestionIndex + 1}/{lesson.assessment.questions.length}
              </div>
              <div className="text-sm text-gray-600">Question</div>
            </div>
            <div className="text-center bg-gray-100 rounded-lg p-3">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-600">Time Left</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-gray-900 h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${((currentQuestionIndex + 1) / lesson.assessment.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Quiz Instructions */}
      {!isSubmitted && currentQuestionIndex === 0 && (
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="mr-2 h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quiz Instructions
          </h2>
          <ul className="space-y-3">
            {lesson.assessment.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 mt-1 mr-3 text-gray-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-gray-700">{instruction}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="bg-white p-3 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-900">{lesson.assessment.totalQuestions}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-900">{lesson.assessment.passingScore}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center border border-gray-200">
              <div className="text-lg font-bold text-gray-900">{lesson.assessment.timeLimit} min</div>
              <div className="text-sm text-gray-600">Time Limit</div>
            </div>
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 mb-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium mr-4">
            Question {currentQuestionIndex + 1}
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
            {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {currentQuestion.question}
        </h2>
        
        <div className="space-y-4">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswers[currentQuestion.id] === option.id;
            
            return (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                className={`w-full text-left p-5 rounded-lg border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 ${
                    isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-800 text-lg">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <svg className="inline-block h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        
        {currentQuestionIndex < lesson.assessment.questions.length - 1 ? (
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestion.id]}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${
              selectedAnswers[currentQuestion.id]
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Next Question
            <svg className="inline-block h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmitQuiz}
            disabled={!selectedAnswers[currentQuestion.id]}
            className={`px-6 py-3 rounded-lg font-medium text-white transition-all ${
              selectedAnswers[currentQuestion.id]
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Submit Quiz
            <svg className="inline-block h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizView;