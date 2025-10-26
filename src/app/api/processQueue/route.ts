export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { VercelLessonQueue } from '@/app/services/vercelQueue.service';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' }, 
        { status: 400 }
      );
    }

    // Fetch the lesson from the database to get the outline
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('outline')
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found in database' }, 
        { status: 404 }
      );
    }

    // Get the queue instance
    const queue = VercelLessonQueue.getInstance();
    
    // Process the lesson (within Vercel timeout limits)
    await queue.processLesson(lessonId, lesson.outline);

    return NextResponse.json({ 
      message: 'Lesson processing completed',
      lessonId
    });
  } catch (error: any) {
    console.error('Error processing queue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process lesson' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    
    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' }, 
        { status: 400 }
      );
    }

    // Fetch the lesson status from the database
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('status')
      .eq('id', lessonId)
      .single();

    if (error || !lesson) {
      return NextResponse.json(
        { error: 'Lesson not found in database' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: lessonId,
      status: lesson.status
    });
  } catch (error: any) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lesson status' }, 
      { status: 500 }
    );
  }
}