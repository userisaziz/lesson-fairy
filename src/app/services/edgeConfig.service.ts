import { get } from '@vercel/edge-config';

// Initialize Edge Config
const EDGE_CONFIG_ITEM_KEY = 'lesson_generation_queue';

export interface LessonGenerationStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export async function getLessonGenerationStatus(lessonId: string): Promise<LessonGenerationStatus | null> {
  try {
    const queue = await get<Record<string, LessonGenerationStatus>>(EDGE_CONFIG_ITEM_KEY) || {};
    return queue[lessonId] || null;
  } catch (error) {
    console.error('Error fetching lesson generation status from Edge Config:', error);
    return null;
  }
}

export async function getAllLessonGenerationStatus(): Promise<Record<string, LessonGenerationStatus>> {
  try {
    const queue = await get<Record<string, LessonGenerationStatus>>(EDGE_CONFIG_ITEM_KEY) || {};
    return queue;
  } catch (error) {
    console.error('Error fetching all lesson generation status from Edge Config:', error);
    return {};
  }
}

// Function to check if Edge Config is available
export function isEdgeConfigAvailable(): boolean {
  // Check if we're in a Vercel environment with Edge Config
  return !!process.env.EDGE_CONFIG;
}