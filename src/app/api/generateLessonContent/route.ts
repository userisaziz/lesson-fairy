import { NextResponse } from 'next/server';
import { generateLessonContentAsync } from '@/app/services/contentGenrationService';

export async function POST(request: Request) {
  try {
    const { lessonId, outline } = await request.json();

    if (!lessonId || !outline) {
      return NextResponse.json(
        { error: 'Lesson ID and outline are required' }, 
        { status: 400 }
      );
    }

    // Trigger the async content generation
    // This will run in the background and update the database
    generateLessonContentAsync(lessonId, outline);

    return NextResponse.json({ message: 'Content generation started' });
  } catch (error: any) {
    console.error('Error in generateLessonContent API:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to start content generation' }, 
      { status: 500 }
    );
  }
}