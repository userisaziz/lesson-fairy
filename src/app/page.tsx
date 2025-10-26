"use client";

import { useState, useEffect } from "react";
import LessonGenerator from "@/components/LessonGenerator";
import LessonsTable from "@/components/LessonsTable";
import { supabase } from "@/lib/supabaseClient";
import { Lesson } from "@/types/lesson";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch lessons from Supabase
  useEffect(() => {
    fetchLessons();

    // Set up real-time subscription
    const channel = supabase
      .channel("lessons-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "lessons",
        },
        (payload) => {
          setLessons([payload.new as Lesson, ...lessons]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "lessons",
        },
        (payload) => {
          const updatedLesson = payload.new as Lesson;
          const updatedLessons = lessons.map((lesson) =>
            lesson.id === updatedLesson.id ? updatedLesson : lesson
          );
          setLessons(updatedLessons);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching lessons:", error);
        return;
      }

      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonGenerated = (id: string) => {
    setLessonId(id);
    // The new lesson will be added to the list via the real-time subscription.
    // No need to refetch here.
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-gray-200">
  <div className="container mx-auto flex h-20 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <svg
          className="h-10 w-10 text-gray-700" // increased from h-5 w-5
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        <div className="flex flex-col">

        <span className="font-semibold text-2xl">
          Lesson F<span className="text-blue-500">AI</span>ry
        </span>
      <p className="text-sm text-gray-500">Create smart lessons instantly with AI</p> {/* tagline */}
        </div>
      </div>
    </div>
  </div>
</header>


      {/* Main Content */}
      <main className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="py-6 space-y-6 sm:py-8 sm:space-y-8">
      
          {/* Lesson Generator Section */}
          <LessonGenerator onLessonGenerated={handleLessonGenerated} />

          {/* Recent Lessons Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-gray-900">Recent Lessons</h2>
              <p className="text-sm text-gray-600">
                View and manage your latest lessons
              </p>
            </div>

            {loading ? (
              <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-gray-300">
                <div className="flex flex-col items-center gap-2">
                  <svg
                    className="h-6 w-6 animate-spin text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-sm text-gray-500">Loading lessons...</p>
                </div>
              </div>
            ) : (
              <LessonsTable lessons={lessons} onLessonsUpdate={setLessons} />
            )}
          </div>
        </div>
      </main>

     
    </div>
  );
}