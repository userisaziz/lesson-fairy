import { NextResponse } from 'next/server';
import { createLessonRecord } from '@/app/services/database.service';
import { generateLessonContentAsync } from '@/app/services/contentGenrationService';

export async function POST(request: Request) {
  try {
    const { outline } = await request.json();

    if (!outline) {
      return NextResponse.json(
        { error: 'Outline is required' }, 
        { status: 400 }
      );
    }

    // Validate outline length
    if (outline.length < 3 || outline.length > 500) {
      return NextResponse.json(
        { error: 'Outline must be between 3 and 500 characters' }, 
        { status: 400 }
      );
    }

    const lesson = await createLessonRecord(outline);
    
    // Generate content asynchronously (non-blocking)
    generateLessonContentAsync(lesson.id, outline);

    return NextResponse.json(lesson);
  } catch (error: any) {
    console.error('Error in generateLesson API:', error);
    
    // Return a more user-friendly error message
    const errorMessage = error.message || 'Failed to create lesson';
    const userMessage = errorMessage.includes('Failed to create lesson') 
      ? 'Unable to create lesson at this time. Please try again later.'
      : errorMessage;
    
    return NextResponse.json(
      { error: userMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined }, 
      { status: 500 }
    );
  }
}