'use client';

import React from 'react';
import { LessonContent as LessonData, Question } from '@/types/lesson';

interface ResultsViewProps {
  lesson: LessonData;
  score: number;
  userAnswers: {[key: number]: string};
  onRetakeQuiz: () => void;
  onBackToLesson: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ 
  lesson, 
  score, 
  userAnswers, 
  onRetakeQuiz, 
  onBackToLesson 
}) => {
  const isPassed = score >= lesson.assessment.passingScore;
  const correctAnswers = lesson.assessment.questions.filter(question => {
    const userAnswer = userAnswers[question.id];
    const correctOption = question.options.find(option => option.isCorrect);
    return userAnswer && correctOption && userAnswer === correctOption.id;
  }).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Results Header */}
      <div className={`rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-8 mb-6 text-center border ${
        isPassed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${
            isPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isPassed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isPassed ? 'Congratulations! You Passed!' : 'Quiz Results'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {isPassed 
            ? 'You have successfully completed the quiz.' 
            : 'You did not reach the passing score. Review the material and try again.'}
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 mt-6">
          <div className="text-center bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-4xl font-bold text-gray-900">{score}%</div>
            <div className="text-gray-600">Your Score</div>
          </div>
          
          <div className="text-center bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-4xl font-bold text-gray-900">{correctAnswers}/{lesson.assessment.questions.length}</div>
            <div className="text-gray-600">Correct Answers</div>
          </div>
          
          <div className="text-center bg-white rounded-xl p-4 border border-gray-200">
            <div className={`text-4xl font-bold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              {isPassed ? 'Passed' : 'Failed'}
            </div>
            <div className="text-gray-600">Status</div>
          </div>
        </div>
        
        {isPassed && lesson.certificate.enabled && (
          <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200 inline-block">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium text-yellow-800">Certificate Unlocked!</span>
            </div>
            <p className="mt-2 text-sm text-yellow-700">You can download your certificate from your profile.</p>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="mr-2 h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Performance Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div className="text-3xl font-bold text-gray-900">{lesson.assessment.questions.length}</div>
            <div className="text-gray-600">Total Questions</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <div className="text-3xl font-bold text-green-600">{correctAnswers}</div>
            <div className="text-gray-600">Correct Answers</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
            <div className="text-3xl font-bold text-red-600">{lesson.assessment.questions.length - correctAnswers}</div>
            <div className="text-gray-600">Incorrect Answers</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              isPassed ? 'bg-green-500' : 'bg-red-500'
            }`} 
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>0%</span>
          <span className="font-medium">{score}%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Answer Review */}
      <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 mb-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="mr-2 h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Answer Review
        </h2>
        
        <div className="space-y-6">
          {lesson.assessment.questions.map((question: Question) => {
            const userAnswerId = userAnswers[question.id];
            const userAnswer = question.options.find(option => option.id === userAnswerId);
            const correctOption = question.options.find(option => option.isCorrect);
            const isCorrect = userAnswerId === correctOption?.id;
            
            return (
              <div 
                key={question.id} 
                className={`border rounded-lg p-5 transition-all ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    isCorrect ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {isCorrect ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{question.question}</h3>
                </div>
                
                <div className="ml-11 space-y-3">
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <span className="font-medium mr-2 text-gray-700">Your Answer:</span>
                    <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {userAnswer ? userAnswer.text : 'No answer selected'}
                    </span>
                  </div>
                  
                  {!isCorrect && (
                    <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                      <span className="font-medium mr-2 text-gray-700">Correct Answer:</span>
                      <span className="text-green-600">{correctOption?.text}</span>
                    </div>
                  )}
                  
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-medium mr-2 text-gray-700">Explanation:</span>
                    <span className="text-gray-700">{question.explanation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onRetakeQuiz}
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-all"
        >
          <svg className="inline-block h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retake Quiz
        </button>
        <button
          onClick={onBackToLesson}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all"
        >
          <svg className="inline-block h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
          </svg>
          Back to Lesson
        </button>
      </div>
    </div>
  );
};

export default ResultsView;