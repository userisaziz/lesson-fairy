'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lesson } from '@/types/lesson';

interface LessonsTableProps {
  lessons: Lesson[];
  onLessonsUpdate: (lessons: Lesson[]) => void;
}

export default function LessonsTable({ lessons, onLessonsUpdate }: LessonsTableProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('lessons-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lessons',
        },
        (payload) => {
          onLessonsUpdate([payload.new as Lesson, ...lessons]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'lessons',
        },
        (payload) => {
          const updatedLesson = payload.new as Lesson;
          const updatedLessons = lessons.map((lesson) =>
            lesson.id === updatedLesson.id ? updatedLesson : lesson
          );
          onLessonsUpdate(updatedLessons);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessons, onLessonsUpdate]);

  const handleViewLesson = (id: string) => {
    router.push(`/lessons/${id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'generating':
        return (
          <span className="inline-flex items-center rounded-md border border-transparent bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            <svg className="mr-1.5 h-2 w-2 fill-amber-500" viewBox="0 0 6 6">
              <circle cx="3" cy="3" r="3" />
            </svg>
            Generating
          </span>
        );
      case 'generated':
        return (
          <span className="inline-flex items-center rounded-md border border-transparent bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <svg className="mr-1.5 h-2 w-2 fill-emerald-500" viewBox="0 0 6 6">
              <circle cx="3" cy="3" r="3" />
            </svg>
            Ready
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-transparent bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20">
            <svg className="mr-1.5 h-2 w-2 fill-slate-500" viewBox="0 0 6 6">
              <circle cx="3" cy="3" r="3" />
            </svg>
            Unknown
          </span>
        );
    }
  };

  // Get visual indicators for lessons
  const getVisualIndicators = (lesson: Lesson) => {
    const indicators = [];
    
    if (lesson.image_url) {
      indicators.push(
        <span key="image" className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
          <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Image
        </span>
      );
    }
    
    if (lesson.diagram_svg) {
      indicators.push(
        <span key="diagram" className="inline-flex items-center rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-700/10">
          <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Diagram
        </span>
      );
    }
    
    if (lesson.content) {
      indicators.push(
        <span key="quiz" className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
          <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quiz
        </span>
      );
    }
    
    return indicators.length > 0 ? (
      <div className="flex flex-col gap-1.5">
        {indicators}
      </div>
    ) : (
      <span className="text-xs text-slate-500">—</span>
    );
  };

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center sm:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:h-16 sm:w-16">
          <svg className="h-6 w-6 text-gray-400 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">No lessons yet</h3>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Get started by creating a new lesson.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_3px_10px_rgb(0,0,0,0.08)]">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                Lesson
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                Status
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                Created
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                Visuals
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 sm:px-6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {lessons.map((lesson) => (
              <tr key={lesson.id} className="transition-colors hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  <div className="text-sm font-medium text-gray-900">
                    {lesson.outline}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  {getStatusBadge(lesson.status)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="mr-1.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <time dateTime={lesson.created_at}>
                      {new Date(lesson.created_at).toLocaleDateString()}
                      <span className="hidden sm:inline"> at {new Date(lesson.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </time>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                  {getVisualIndicators(lesson)}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right sm:px-6">
                  <button
                    onClick={() => handleViewLesson(lesson.id)}
                    disabled={lesson.status !== 'generated'}
                    className={`inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                      lesson.status === 'generated' 
                        ? 'bg-gray-900 text-white shadow hover:bg-gray-800' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {lesson.status === 'generated' ? 'View' : 'Generating...'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}