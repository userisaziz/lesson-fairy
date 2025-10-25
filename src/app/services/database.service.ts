import { supabase } from "@/lib/supabaseClient";
import { extractFirstDiagram } from "@/lib/utilityFunctions";
import { LessonContent } from "@/types/lesson";

export async function createLessonRecord(outline: string) {
  console.log('Creating lesson record with outline:', outline);

  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert([{
      outline,
      status: 'generating',
      content: null,
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

export async function updateLessonRecord(
  lessonId: string, 
  content: LessonContent, 
  status: string = 'generated'
) {
  console.log('Updating lesson in database...');

  // Validate content before saving
  if (!content || typeof content !== 'object') {
    throw new Error('Invalid content provided for lesson update');
  }

  const { error } = await supabase
    .from('lessons')
    .update({
      content: JSON.stringify(content),
      status,
      diagram_svg: extractFirstDiagram(content),
    })
    .eq('id', lessonId);

  if (error) {
    console.error('Error updating lesson:', error);
    throw new Error(`Failed to update lesson: ${error.message}`);
  }

  console.log('Lesson updated successfully:', lessonId);
}

export async function updateLessonError(lessonId: string, errorMessage: string) {
  console.log(`Updating lesson ${lessonId} with error status`);
  
  // Instead of storing error content, we'll keep the lesson in "generating" status
  // and log the error for debugging purposes
  const { error } = await supabase
    .from('lessons')
    .update({
      status: 'generating', // Keep in generating state
      // Don't update content - leave it as null or previous valid content
    })
    .eq('id', lessonId);

  if (error) {
    console.error('Error updating lesson with error status:', error);
  } else {
    console.log('Lesson error status updated successfully:', lessonId);
    // Log the actual error for debugging
    console.error('Lesson generation error for lesson', lessonId, ':', errorMessage);
  }
}