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
  console.log('Updating lesson in database...', { lessonId, status });

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
  
  // Truncate error message if too long to avoid database issues
  const truncatedErrorMessage = errorMessage.length > 1000 
    ? errorMessage.substring(0, 1000) + '... (truncated)'
    : errorMessage;
  
  try {
    // Update lesson status to 'error' to indicate failure to the UI
    const { error } = await supabase
      .from('lessons')
      .update({
        status: 'error',
        error_message: truncatedErrorMessage, // Store the actual error message
      })
      .eq('id', lessonId);

    if (error) {
      console.error('Error updating lesson with error status:', error);
      
      // If the error is due to missing column, try without error_message
      if (error.message && error.message.includes('error_message')) {
        console.log('Retrying update without error_message column...');
        const { error: retryError } = await supabase
          .from('lessons')
          .update({
            status: 'error'
          })
          .eq('id', lessonId);
          
        if (retryError) {
          console.error('Retry also failed:', retryError);
        } else {
          console.log('Lesson error status updated successfully (without error_message):', lessonId);
        }
      }
    } else {
      console.log('Lesson error status updated successfully:', lessonId);
      // Log the actual error for debugging
      console.error('Lesson generation error for lesson', lessonId, ':', truncatedErrorMessage);
    }
  } catch (err) {
    console.error('Unexpected error in updateLessonError:', err);
    
    // Fallback: try updating without error_message
    try {
      const { error: fallbackError } = await supabase
        .from('lessons')
        .update({
          status: 'error'
        })
        .eq('id', lessonId);
        
      if (fallbackError) {
        console.error('Fallback update also failed:', fallbackError);
      } else {
        console.log('Fallback lesson error status updated successfully:', lessonId);
      }
    } catch (fallbackErr) {
      console.error('Fallback update threw error:', fallbackErr);
    }
  }
}