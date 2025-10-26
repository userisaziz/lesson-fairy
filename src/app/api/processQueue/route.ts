export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { VercelLessonQueue } from '@/app/services/vercelQueue.service';
import { getLesson } from '@/app/services/database.service';

export async function POST(request: Request) {
  try {
    const { lessonId, step, sectionIndex } = await request.json();

    if (!lessonId || !step) {
      return NextResponse.json(
        { error: 'Lesson ID and step are required' }, 
        { status: 400 }
      );
    }

    const lesson = await getLesson(lessonId);

    const queue = VercelLessonQueue.getInstance();
    await queue.processStep(lessonId, step, lesson.outline);

    return NextResponse.json({ 
      message: `Step '${step}' processed successfully for lesson ${lessonId}`,
    });
  } catch (error: any) {
    console.error(`Error processing step for lesson:', error`);
    return NextResponse.json(
      { error: error.message || 'Failed to process step' }, 
      { status: 500 }
    );
  }
}