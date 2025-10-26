import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

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
      .select('status, progress') // Also fetch progress
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
      status: lesson.status,
      progress: lesson.progress,
    });
  } catch (error: any) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lesson status' },
      { status: 500 }
    );
  }
}
