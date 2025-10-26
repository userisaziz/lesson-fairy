import { NextResponse } from 'next/server';
import { get, getAll } from '@vercel/edge-config';

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

    // Get the lesson status from Edge Config
    const queueKey = `lesson_generation_queue`;
    const queue = await get(queueKey) as Record<string, any> || {};
    
    const lessonStatus = queue[lessonId];
    
    if (!lessonStatus) {
      return NextResponse.json(
        { error: 'Lesson not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(lessonStatus);
  } catch (error: any) {
    console.error('Error fetching from Edge Config:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lesson status' }, 
      { status: 500 }
    );
  }
}

// For POST requests, we'll return a placeholder since Edge Config updates
// need to happen via Vercel CLI or dashboard in this implementation
export async function POST(request: Request) {
  return NextResponse.json({ 
    message: 'Edge Config updates should be done via Vercel CLI or dashboard',
    note: 'This endpoint is for demonstration purposes only'
  });
}