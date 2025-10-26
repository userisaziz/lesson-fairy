'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface LessonGeneratorProps {
  onLessonGenerated: (lessonId: string) => void;
}

const LessonGenerator: React.FC<LessonGeneratorProps> = ({ onLessonGenerated }) => {
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      toast.error('Please enter a lesson topic');
      return;
    }

    setLoading(true);
    
    try {
      // First, create the lesson record
      const response = await fetch('/api/generateLesson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outline: userInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate lesson');
      }

      const data = await response.json();
      
      // Then, trigger the content generation in the background
      try {
        await fetch('/api/generateLessonContent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId: data.id, outline: userInput }),
        });
      } catch (contentError) {
        console.error('Failed to trigger content generation:', contentError);
        // This is non-critical - the lesson will still be created
      }
      
      toast.success('Lesson generation started!');
      onLessonGenerated(data.id);
      
      router.push(`/lessons/${data.id}`);
    } catch (error: any) {
      console.error('Error generating lesson:', error);
      toast.error(error.message || 'Failed to generate lesson. Please try again.');
    } finally {
      setLoading(false);
      setUserInput('');
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-xl border border-gray-200 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.08)] hover:shadow-[0_5px_15px_rgb(0,0,0,0.1)] transition-shadow">
        <div className="p-8 space-y-8">
          {/* Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              Generate a New Lesson
            </h2>
            <p className="text-gray-500">
              Enter any topic and AI will create a comprehensive lesson for you
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="lessonTopic" className="text-sm font-medium text-gray-700">
                What do you want to learn?
              </label>
              <textarea
                id="lessonTopic"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Introduction to Machine Learning, History of Ancient Rome, Photography basics..."
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                rows={4}
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !userInput.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900/20 disabled:pointer-events-none disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating your lesson...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Lesson
                </>
              )}
            </button>
          </form>

          {/* Example Topics */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick start with an example
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'A quiz on India',
                'Machine Learning basics',
                'Photography 101',
                'Ancient Rome history',
                'Cryptocurrency explained',
                'Nutrition fundamentals'
              ].map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setUserInput(example)}
                  className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {/* Features */}
          <div className="rounded-lg bg-gray-50 p-6 space-y-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Every lesson includes:</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200">
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900">Detailed Content</p>
                  <p className="text-xs text-gray-600">Well-structured explanations</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200">
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900">Practice Quizzes</p>
                  <p className="text-xs text-gray-600">Test your understanding</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-gray-200">
                  <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-gray-900">Visual Aids</p>
                  <p className="text-xs text-gray-600">Images and diagrams</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonGenerator;