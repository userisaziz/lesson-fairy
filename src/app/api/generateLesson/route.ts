import { NextResponse } from 'next/server';
import { createLessonRecord } from '@/app/services/database.service';
import { VercelLessonQueue } from '@/app/services/vercelQueue.service';

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

    // Check if required environment variables are set
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service is not properly configured. Please contact the administrator.' }, 
        { status: 500 }
      );
    }

    const lesson = await createLessonRecord(outline);
    
    // Trigger background processing (this will run within Vercel's timeout limits)
    try {
      // Use absolute URL for server-side fetch
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : 'http://localhost:3000';
        
      await fetch(`${baseUrl}/api/generateLessonContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId: lesson.id, outline }),
      });
    } catch (processError) {
      console.error('Failed to trigger queue processing:', processError);
      // This is non-critical - the lesson will still be created
    }

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