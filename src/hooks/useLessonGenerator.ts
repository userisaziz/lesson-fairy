import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function useLessonGenerator({ onLessonGenerated }: { onLessonGenerated: (lessonId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const generateLesson = async (outline: string) => {
    setLoading(true);
    setProgress(0);
    try {
      // Step 1: Create lesson record
      const res = await fetch('/api/generateLesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outline }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create lesson');
      }

      const lesson = await res.json();
      toast.success('Lesson created! Starting generation...');
      onLessonGenerated(lesson.id);

      // Step 2: Start polling for lesson generation
      pollLessonStatus(lesson.id);

    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const pollLessonStatus = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/lessonStatus?lessonId=${lessonId}`);
      if (!res.ok) {
        throw new Error('Failed to get lesson status');
      }
      const data = await res.json();
      setProgress(data.progress || 0);

      if (data.status === 'generated') {
        toast.success('Lesson generated successfully!');
        setLoading(false);
        router.push(`/lessons/${lessonId}`);
        return;
      }

      if (data.status === 'error') {
        throw new Error(data.error_message || 'Lesson generation failed');
      }

      // Determine next step
      let nextStep = '';
      if (data.progress < 10) {
        nextStep = 'generateContent';
      } else if (data.progress < 30) {
        nextStep = 'parseAndSaveContent';
      } else if (data.progress < 90) {
        nextStep = 'generateVisuals';
      } else {
        nextStep = 'finalize';
      }

      // Process next step
      await fetch('/api/processQueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, step: nextStep }),
      });

      // Continue polling
      setTimeout(() => pollLessonStatus(lessonId), 5000);

    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return { loading, progress, generateLesson };
}
