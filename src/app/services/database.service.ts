import { supabase } from "@/lib/supabaseClient";
import { extractFirstDiagram } from "@/lib/utilityFunctions";
import { Lesson, LessonContent } from "@/types/lesson";

export async function createLessonRecord(outline: string): Promise<Lesson> {
  console.log('Creating lesson record with outline:', outline);

  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert([{
      outline,
      status: 'generating',
      progress: 0,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error inserting lesson:', error);
    throw new Error(`Failed to create lesson: ${error.message}`);
  }

  console.log('Lesson record created successfully:', lesson.id);
  return lesson;
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error || !lesson) {
    throw new Error('Lesson not found');
  }

  return lesson;
}

export async function updateLessonRecord(lessonId: string, data: Partial<Lesson>): Promise<void> {
  console.log('Updating lesson in database...', { lessonId, data });

  const { error } = await supabase
    .from('lessons')
    .update(data)
    .eq('id', lessonId);

  if (error) {
    console.error('Error updating lesson:', error);
    throw new Error(`Failed to update lesson: ${error.message}`);
  }

  console.log('Lesson updated successfully:', lessonId);
}

export async function updateLessonContent(lessonId: string, content: LessonContent): Promise<void> {
  await updateLessonRecord(lessonId, { 
    json_content: content,
    diagram_svg: extractFirstDiagram(content),
  });
}

export async function updateLessonError(lessonId: string, errorMessage: string): Promise<void> {
  console.log(`Updating lesson ${lessonId} with error status`);
  
  const truncatedErrorMessage = errorMessage.length > 1000 
    ? errorMessage.substring(0, 1000) + '... (truncated)'
    : errorMessage;
  
  await updateLessonRecord(lessonId, { 
    status: 'error',
    error_message: truncatedErrorMessage,
  });
}
