import { generateDiagramWithHuggingFace, generateImageWithHuggingFace, generateWithGemini } from "@/lib/aiUtility";
import { buildImageDescriptionPrompt, buildLessonPrompt } from "./buildLessonPrompt.service";
import { updateLessonError, updateLessonRecord } from "./database.service";
import { cleanJsonString, logGenerationResult } from "@/lib/utilityFunctions";
import { LessonContent } from "@/types/lesson";

// Add retry configuration
const MAX_RETRIES = 2; // Reduced retries to avoid timeouts
const RETRY_DELAY = 1000; // Reduced delay
const REQUEST_TIMEOUT = 45000; // 45 seconds timeout for requests

export async function generateLessonContentAsync(lessonId: string, outline: string) {
  try {
    console.log(`Starting content generation for lesson: ${lessonId}`);
    
    // Step 1: Generate main content
    const prompt = buildLessonPrompt(outline);
    console.log(`Built prompt for lesson ${lessonId}, length: ${prompt.length}`);
    
    const rawContent = await generateContent(prompt, outline);
    console.log(`Generated raw content for lesson ${lessonId}, length: ${rawContent.length}`);
    
    const parsedContent = parseAndValidateContent(rawContent);
    console.log(`Parsed and validated content for lesson ${lessonId}`);
    
    // Post-process to remove unnecessary code examples
    postProcessContent(parsedContent);
    console.log(`Post-processed content for lesson ${lessonId}`);
    
    // Save initial content to database
    await updateLessonRecord(lessonId, { 
      json_content: parsedContent,
      status: 'generating'
    });
    console.log(`Saved initial content to database for lesson ${lessonId}`);
    
    // Step 2: Generate visuals asynchronously
    await enrichContentWithVisuals(lessonId, parsedContent);
    console.log(`Finished generating visuals for lesson ${lessonId}`);
    
    // Step 3: Final update
    await updateLessonRecord(lessonId, { 
      json_content: parsedContent,
      status: 'generated'
    });
    console.log(`Final update completed for lesson ${lessonId}`);
    
    console.log('Content generation completed successfully');
    return; // Success
  } catch (error: any) {
    console.error(`Error generating lesson content for lesson ${lessonId}:`, error);
    const errorMessage = error.message || 'Failed to generate lesson content';
    try {
      await updateLessonError(lessonId, errorMessage);
    } catch (dbError: any) {
      console.error(`Failed to update lesson error status for lesson ${lessonId}:`, dbError);
    }
    return;
  }
}

export async function generateContent(prompt: string, outline: string): Promise<string> {
  // Try Gemini if API key is available
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  console.log('Attempting to generate content with Gemini...');
  
  try {
    console.log('Using Gemini...');
    // Add timeout to the generateWithGemini call
    const contentPromise = generateWithGemini(prompt);
    const timeoutPromise = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('Gemini request timeout after 45 seconds')), REQUEST_TIMEOUT)
    );
    
    const content = await Promise.race([contentPromise, timeoutPromise]);
    
    if (!content?.trim()) {
      throw new Error('Gemini returned empty response');
    }

    console.log('✓ Gemini generation succeeded');
    logGenerationResult('Gemini', content);
    return content;
  } catch (error: any) {
    console.error(`Gemini generation failed:`, error);
    const errorMessage = error.message || 'Unknown error';
    throw new Error(`Failed to generate content with Gemini: ${errorMessage}`);
  }
}

export function parseAndValidateContent(rawContent: string): LessonContent {
  console.log('Parsing and validating content...');
  
  const cleanContent = cleanJsonString(rawContent);
  console.log(`Cleaned content length: ${cleanContent.length}`);
  
  try {
    const parsed = JSON.parse(cleanContent);
    console.log('Successfully parsed JSON content');
    
    // Validate required structure
    if (!parsed.metadata?.title) {
      throw new Error('Generated content missing required metadata.title');
    }
    
    if (!parsed.content?.introduction) {
      throw new Error('Generated content missing required content.introduction');
    }
    
    if (!Array.isArray(parsed.content?.learningObjectives)) {
      throw new Error('Generated content missing required content.learningObjectives array');
    }
    
    if (!Array.isArray(parsed.content?.sections)) {
      throw new Error('Generated content missing required content.sections array');
    }
    
    // Validate that sections have required properties
    if (parsed.content.sections.length === 0) {
      throw new Error('Generated content has no sections');
    }
    
    // Validate each section
    for (const section of parsed.content.sections) {
      if (!section.title || !section.content) {
        throw new Error('Generated content has sections with missing title or content');
      }
      
      // Validate subsections if they exist
      if (section.subsections && !Array.isArray(section.subsections)) {
        throw new Error('Generated content has invalid subsections format');
      }
      
      if (section.subsections) {
        for (const subsection of section.subsections) {
          if (!subsection.title || !subsection.content) {
            throw new Error('Generated content has subsections with missing title or content');
          }
        }
      }
    }
    
    // Add provider info if missing
    if (!parsed.metadata.generatedBy) {
      parsed.metadata.generatedBy = 'Unknown';
    }
    
    // Ensure all required fields are present with defaults
    if (!parsed.metadata.difficulty) {
      parsed.metadata.difficulty = 'Beginner';
    }
    
    if (!parsed.metadata.estimatedTime) {
      parsed.metadata.estimatedTime = 10;
    }
    
    if (!parsed.metadata.tags) {
      parsed.metadata.tags = [];
    }
    
    if (!parsed.metadata.author) {
      parsed.metadata.author = 'AI Instructor';
    }
    
    if (!parsed.metadata.createdAt) {
      parsed.metadata.createdAt = new Date().toISOString();
    }
    
    console.log('✓ JSON parsed and validated successfully');
    console.log('Lesson title:', parsed.metadata?.title);
    
    return parsed;
  } catch (error: any) {
    console.error('✗ Invalid JSON generated:', error);
    console.error('Content preview:', cleanContent.substring(0, 500));
    const errorMessage = error.message || 'Unknown error';
    throw new Error(`AI generated invalid JSON content: ${errorMessage}`);
  }
}

// Post-process content to remove unnecessary code examples
function postProcessContent(content: LessonContent) {
  // Remove code examples from non-technical sections
  if (content.content?.sections) {
    for (const section of content.content.sections) {
      // If the section doesn't have a code example, skip
      if (!section.codeExample) {
        continue;
      }
      
      // If the code example is empty or just whitespace, remove it
      if (!section.codeExample.code || section.codeExample.code.trim() === '') {
        delete section.codeExample;
        continue;
      }
      
      // For non-programming topics, remove code examples
      const nonProgrammingCategories = [
        'history', 'literature', 'art', 'music', 'geography', 'biology', 
        'chemistry', 'physics', 'mathematics', 'science', 'social studies',
        'language arts', 'physical education', 'health'
      ];
      
      const isProgrammingTopic = content.metadata?.category?.toLowerCase().includes('program') || 
                                content.metadata?.category?.toLowerCase().includes('code') ||
                                content.metadata?.category?.toLowerCase().includes('tech') ||
                                content.metadata?.category?.toLowerCase().includes('software') ||
                                content.metadata?.category?.toLowerCase().includes('web') ||
                                content.metadata?.category?.toLowerCase().includes('app');
      
      const isNonProgrammingTopic = nonProgrammingCategories.some(cat => 
        content.metadata?.category?.toLowerCase().includes(cat)
      );
      
      // If it's clearly a non-programming topic, remove code examples
      if (isNonProgrammingTopic && !isProgrammingTopic) {
        delete section.codeExample;
      }
    }
  }
}

// Modified to work with lesson ID for progress tracking
export async function enrichContentWithVisuals(lessonId: string, content: LessonContent) {
  if (!process.env.GEMINI_API_KEY || !content.content.sections) {
    console.log('Skipping visual enrichment - no API key or sections');
    return;
  }

  console.log('Generating visuals for lesson sections...');

  for (const [index, section] of content.content.sections.entries()) {
    if (!section.visuals?.description) {
      console.log(`Skipping section ${index} - no visuals description`);
      continue;
    }

    console.log(`Generating ${section.visuals.type} for: ${section.title}`);
    
    try {
      const visual = await generateVisual(section.visuals);
      section.generatedVisual = visual || '';
      console.log(`Generated visual for section ${section.title}: ${!!visual}`);
      
      // Update progress in database after each visual generation
      await updateLessonRecord(lessonId, { 
        json_content: content,
        status: 'generating'
      });
    } catch (error: any) {
      console.error(`Error generating ${section.visuals.type} for "${section.title}":`, error);
      section.generatedVisual = ''; // Set empty string to avoid breaking UI
    }
    
    console.log(`Visual generation complete for: ${section.title} (${index + 1}/${content.content.sections.length})`);
  }
}

export async function generateVisual(visualConfig: { description: string; type: string }): Promise<string> {
  try {
    if (visualConfig.type === 'diagram') {
      return await generateDiagram(visualConfig.description);
    } else if (visualConfig.type === 'image') {
      return await generateImage(visualConfig.description);
    }
  } catch (error: any) {
    console.error(`Error generating ${visualConfig.type}:`, error);
    // Return empty string instead of throwing to allow continuation
    return '';
  }
  
  return '';
}

export async function generateDiagram(description: string): Promise<string> {
  console.log('Generating diagram with Hugging Face...');
  try {
    const diagram = await generateDiagramWithHuggingFace(description);
    console.log(`Diagram generation ${diagram ? 'succeeded' : 'returned empty'}`);
    return diagram || '';
  } catch (error: any) {
    console.error('Diagram generation failed:', error);
    // Return empty string instead of throwing to allow continuation
    return '';
  }
}

export async function generateImage(description: string): Promise<string> {
  console.log('Generating image with Hugging Face...');
  try {
    let image = await generateImageWithHuggingFace(description);
    console.log(`Image generation ${image ? 'succeeded' : 'returned empty'}`);
    
    if (!image && process.env.GEMINI_API_KEY) {
      console.log('Falling back to image description with Gemini...');
      const prompt = buildImageDescriptionPrompt(description);
      // Add timeout to the generateWithGemini call
      const contentPromise = generateWithGemini(prompt);
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Gemini fallback timeout after 25 seconds')), 25000)
      );
      
      try {
        const content = await Promise.race([contentPromise, timeoutPromise]);
        console.log(`Gemini fallback ${content ? 'succeeded' : 'returned empty'}`);
        return content || '';
      } catch (error) {
        console.error('Gemini fallback failed:', error);
        return '';
      }
    }
    
    return image || '';
  } catch (error: any) {
    console.error('Image generation failed:', error);
    // Return empty string instead of throwing to allow continuation
    return '';
  }
}