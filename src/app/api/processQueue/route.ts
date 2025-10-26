import { NextResponse } from 'next/server';
import { VercelLessonQueue } from '@/app/services/vercelQueue.service';

export async function POST(request: Request) {
  try {
    const { lessonId } = await request.json();

    if (!lessonId) {
      return NextResponse.json(
        { error: 'Lesson ID is required' }, 
        { status: 400 }
      );
    }

    // Get the queue instance
    const queue = VercelLessonQueue.getInstance();
    
    // Get lesson status
    const status = queue.getLessonStatus(lessonId);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Lesson not found in queue' }, 
        { status: 404 }
      );
    }

    // Process the lesson (within Vercel timeout limits)
    await queue.processLesson(lessonId);

    return NextResponse.json({ 
      message: 'Lesson processing completed',
      lessonId,
      status: queue.getLessonStatus(lessonId)
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

    // Get the queue instance
    const queue = VercelLessonQueue.getInstance();
    
    // Get lesson status
    const status = queue.getLessonStatus(lessonId);
    
    if (!status) {
      return NextResponse.json(
        { error: 'Lesson not found in queue' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Error fetching queue status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch lesson status' }, 
      { status: 500 }
    );
  }
}