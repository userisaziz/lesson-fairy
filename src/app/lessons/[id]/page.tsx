'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lesson } from '@/types/lesson';
import LessonView from '@/components/LessonView';
import QuizView from '@/components/QuizView';
import ResultsView from '@/components/ResultsView';
import DiagramRenderer from '@/components/DiagramRenderer';
import { Toaster, toast } from 'react-hot-toast';

export default function LessonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentView, setCurrentView] = useState<'lesson' | 'quiz' | 'results'>('lesson');
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [retryCount, setRetryCount] = useState(0); // For retry mechanism

  useEffect(() => {
    if (!id) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        if (!data) {
          setNotFound(true);
          return;
        }

        setLesson(data as Lesson);
      } catch (error: any) {
        console.error('Error fetching lesson:', error);
        toast.error('Failed to load lesson: ' + (error.message || 'Unknown error'));
        
        // Implement retry mechanism for transient errors
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();

    // Subscribe to real-time updates for this lesson
    const channel = supabase
      .channel('lesson-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lessons',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setLesson(payload.new as Lesson);
          // Reset views when content updates
          setCurrentView('lesson');
          setQuizScore(null);
          setUserAnswers({});
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center h-48 sm:h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your lesson...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 sm:p-8 text-center border border-gray-200">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-3">Lesson Not Found</h1>
            <p className="text-gray-600 mb-5 text-sm sm:text-base">The requested lesson could not be found.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Back to Generator
              </button>
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Parse the JSON content if it exists
  let parsedLessonData = null;
  let parseError = null;
  let isContentError = false;
  
  try {
    if (lesson.content) {
      // Log the raw content for debugging
      console.log('Raw lesson content:', lesson.content);
      console.log('Lesson status:', lesson.status);
      
      // If content is already a JSON string, parse it
      if (typeof lesson.content === 'string') {
        const parsed = JSON.parse(lesson.content);
        
        // Check if this is an error content
        if (parsed.error && parsed.message) {
          isContentError = true;
          parseError = new Error(parsed.message);
        } else {
          parsedLessonData = parsed;
        }
      } else {
        // If content is already an object, check if it's an error
        if ((lesson.content as any).error && (lesson.content as any).message) {
          isContentError = true;
          parseError = new Error((lesson.content as any).message);
        } else {
          parsedLessonData = lesson.content;
        }
      }
    }
    
    // Also check json_content field
    if (lesson.json_content) {
      parsedLessonData = lesson.json_content;
    }
  } catch (e: any) {
    console.error('Error parsing lesson content:', e);
    console.error('Content:', lesson.content);
    parseError = e;
  }

  const handleQuizComplete = (score: number, answers: {[key: number]: string}) => {
    setQuizScore(score);
    setUserAnswers(answers);
    setCurrentView('results');
  };

  const handleRetakeQuiz = () => {
    setQuizScore(null);
    setUserAnswers({});
    setCurrentView('quiz');
  };

  const handleBackToLesson = () => {
    setCurrentView('lesson');
  };

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  // Handle content parsing errors
  if (parseError && isContentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 sm:p-8 text-center border border-gray-200">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-50 flex items-center justify-center">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-3">Lesson Generation Failed</h2>
            <p className="text-gray-600 mb-5 text-sm sm:text-base">
              There was an error generating this lesson. This may be due to a temporary issue with our AI service.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-5 text-left">
              <p className="text-xs text-gray-500">Error details:</p>
              <p className="text-sm text-red-600 mt-1">{parseError.message}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Generate New Lesson
              </button>
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle content parsing errors (non-error content)
  if (parseError && !isContentError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 sm:p-8 text-center border border-gray-200">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-3">Content Error</h2>
            <p className="text-gray-600 mb-5 text-sm sm:text-base">
              There was an error processing this lesson's content. This may be due to a generation issue.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-5 text-left">
              <p className="text-xs text-gray-500">Error details:</p>
              <p className="text-sm text-red-600 mt-1">{parseError.message}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Generate New Lesson
              </button>
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if content is valid with more comprehensive validation
  const isContentValid = lesson.status === 'generated' && 
                        ((lesson.content || lesson.json_content) && 
                        parsedLessonData && 
                        parsedLessonData.metadata && 
                        parsedLessonData.content &&
                        parsedLessonData.content.sections &&
                        Array.isArray(parsedLessonData.content.sections) &&
                        parsedLessonData.content.sections.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base transition-colors"
          >
            <svg className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Generator
          </button>
        </div>

        {lesson.status === 'generating' ? (
          <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 sm:p-8 text-center border border-gray-200">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-gray-900 mb-4 sm:mb-6"></div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Generating Your Lesson</h2>
              <p className="text-gray-600 mb-2 text-sm sm:text-base">Please wait while we create your interactive lesson...</p>
              <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">This usually takes 10-30 seconds</p>
              <div className="w-full max-w-xs sm:max-w-md">
                <div className="bg-gray-200 rounded-full h-2 sm:h-2.5">
                  <div className="bg-gray-900 h-2 sm:h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                </div>
              </div>
              <p className="text-gray-500 text-xs mt-3 sm:mt-4">Tip: You can navigate away and come back later. Your lesson will be saved.</p>
            </div>
          </div>
        ) : isContentValid ? (
          <>
            {/* Display diagram if available */}
            {lesson.diagram_svg && (
              <DiagramRenderer 
                svgContent={lesson.diagram_svg} 
                title={`Diagram for ${parsedLessonData.metadata.title}`} 
              />
            )}
            
            {currentView === 'lesson' && (
              <LessonView 
                lesson={{...lesson, json_content: parsedLessonData}} 
                onQuizStart={handleStartQuiz} 
              />
            )}
            
            {currentView === 'quiz' && (
              <QuizView 
                lesson={parsedLessonData} 
                onQuizComplete={handleQuizComplete} 
              />
            )}
            
            {currentView === 'results' && quizScore !== null && (
              <ResultsView 
                lesson={parsedLessonData} 
                score={quizScore} 
                userAnswers={userAnswers} 
                onRetakeQuiz={handleRetakeQuiz} 
                onBackToLesson={handleBackToLesson} 
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 sm:p-8 text-center border border-gray-200">
            <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-amber-50 flex items-center justify-center">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 mt-3 sm:mt-4">No Valid Content Available</h2>
            <p className="text-gray-600 mb-5 text-sm sm:text-base">
              {lesson.content || lesson.json_content
                ? "This lesson was generated but has invalid content structure." 
                : "This lesson was generated but has no content."}
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-5 text-left">
              <p className="text-xs text-gray-500">Debug info:</p>
              <p className="text-xs text-gray-600 mt-1">Status: {lesson.status}</p>
              <p className="text-xs text-gray-600">Content: {lesson.content ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-600">JSON Content: {lesson.json_content ? 'Yes' : 'No'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Generate Another Lesson
              </button>
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}