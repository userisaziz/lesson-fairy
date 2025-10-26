// This service handles lesson generation using Vercel's infrastructure
// It's designed to work within Vercel's timeout constraints

import { LessonContent } from "@/types/lesson";
import { generateDiagramWithHuggingFace, generateImageWithHuggingFace } from "@/lib/aiUtility";
import { buildImageDescriptionPrompt, buildLessonPrompt } from "./buildLessonPrompt.service";
import { updateLessonError, updateLessonRecord } from "./database.service";
import { cleanJsonString, logGenerationResult } from "@/lib/utilityFunctions";
import { generateContent } from "./contentGenrationService";

// Reduced retry configuration for Vercel compatibility
const MAX_RETRIES = 1; // Minimal retries to stay within timeout limits
const RETRY_DELAY = 500; // Short delay
const REQUEST_TIMEOUT = 20000; // 20 seconds timeout for requests

export interface QueueItem {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  outline: string;
  errorMessage?: string;
  createdAt: string;
}

export class VercelLessonQueue {
  private static instance: VercelLessonQueue;

  private constructor() {}

  static getInstance(): VercelLessonQueue {
    if (!VercelLessonQueue.instance) {
      VercelLessonQueue.instance = new VercelLessonQueue();
    }
    return VercelLessonQueue.instance;
  }

  // Add a lesson to the queue (in this case, we'll work directly with the database)
  async addLesson(lessonId: string, outline: string): Promise<void> {
    // In this implementation, we don't need to store anything in memory
    // The lesson is already in the database with status 'generating'
    console.log(`Lesson ${lessonId} added to queue`);
  }

  // Process a lesson (designed to work within Vercel timeout limits)
  async processLesson(lessonId: string, outline: string): Promise<void> {
    try {
      console.log(`Processing lesson ${lessonId}`);
      
      // Update status to processing in database
      // Note: We're not using the queue item here since we're working directly with DB
      
      // Step 1: Generate main content (with minimal retries)
      const prompt = buildLessonPrompt(outline);
      const rawContent = await this.generateContent(prompt, outline);
      const parsedContent = this.parseAndValidateContent(rawContent);
      
      // Post-process content
      this.postProcessContent(parsedContent);
      
      // Save initial content to database
      await updateLessonRecord(lessonId, parsedContent, 'generating');
      
      // Step 2: Generate visuals (minimal processing to stay within limits)
      await this.enrichContentWithVisuals(lessonId, parsedContent);
      
      // Final update
      await updateLessonRecord(lessonId, parsedContent, 'generated');
      
      console.log(`Lesson ${lessonId} processed successfully`);
    } catch (error: any) {
      console.error(`Error processing lesson ${lessonId}:`, error);
      const errorMessage = error.message || 'Unknown error';
      
      // Update database with error
      try {
        await updateLessonError(lessonId, errorMessage);
      } catch (dbError) {
        console.error(`Failed to update lesson error status for ${lessonId}:`, dbError);
      }
      
      throw error; // Re-throw to be handled by the caller
    }
  }

  private async generateContent(prompt: string, outline: string): Promise<string> {
    // Use the shared generateContent function which has proper error handling and timeout
    const contentPromise = generateContent(prompt, outline);
    const timeoutPromise = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('Content generation timeout after 20 seconds')), REQUEST_TIMEOUT)
    );
    
    return await Promise.race([contentPromise, timeoutPromise]);
  }

  private parseAndValidateContent(rawContent: string): LessonContent {
    console.log('Parsing and validating content...');
    
    const cleanContent = cleanJsonString(rawContent);
    
    try {
      const parsed = JSON.parse(cleanContent);
      
      // Basic validation
      if (!parsed.metadata?.title) {
        throw new Error('Generated content missing required metadata.title');
      }
      
      if (!parsed.content?.introduction) {
        throw new Error('Generated content missing required content.introduction');
      }
      
      if (!Array.isArray(parsed.content?.sections)) {
        throw new Error('Generated content missing required content.sections array');
      }
      
      return parsed;
    } catch (error: any) {
      console.error('Invalid JSON generated:', error);
      throw new Error(`AI generated invalid JSON content: ${error.message}`);
    }
  }

  private postProcessContent(content: LessonContent) {
    // Minimal post-processing to save time
    if (content.content?.sections) {
      for (const section of content.content.sections) {
        // Remove empty code examples quickly
        if (section.codeExample && (!section.codeExample.code || section.codeExample.code.trim() === '')) {
          delete section.codeExample;
        }
      }
    }
  }

  private async enrichContentWithVisuals(lessonId: string, content: LessonContent) {
    if (!process.env.GEMINI_API_KEY || !content.content.sections) {
      return;
    }

    console.log('Generating visuals for lesson sections...');

    // Only generate visuals for the first 2 sections to stay within time limits
    const sectionsToProcess = content.content.sections.slice(0, 2);
    
    for (let i = 0; i < sectionsToProcess.length; i++) {
      const section = sectionsToProcess[i];
      if (!section.visuals?.description) {
        continue;
      }

      console.log(`Generating ${section.visuals.type} for: ${section.title}`);
      
      try {
        const visual = await this.generateVisual(section.visuals);
        section.generatedVisual = visual || '';
        
        // Update database with progress
        await updateLessonRecord(lessonId, content, 'generating');
      } catch (error: any) {
        console.error(`Error generating ${section.visuals.type} for "${section.title}":`, error);
        section.generatedVisual = '';
      }
      
      console.log(`Visual generation complete for: ${section.title}`);
    }
  }

  private async generateVisual(visualConfig: { description: string; type: string }): Promise<string> {
    try {
      if (visualConfig.type === 'diagram') {
        return await generateDiagram(visualConfig.description);
      } else if (visualConfig.type === 'image') {
        return await generateImage(visualConfig.description);
      }
    } catch (error: any) {
      console.error(`Error generating ${visualConfig.type}:`, error);
      return '';
    }
    
    return '';
  }
}

// Simplified visual generation functions
async function generateDiagram(description: string): Promise<string> {
  console.log('Generating diagram with Hugging Face...');
  try {
    const diagram = await generateDiagramWithHuggingFace(description);
    return diagram || '';
  } catch (error: any) {
    console.error('Diagram generation failed:', error);
    return '';
  }
}

async function generateImage(description: string): Promise<string> {
  console.log('Generating image with Hugging Face...');
  try {
    let image = await generateImageWithHuggingFace(description);
    
    if (!image && process.env.GEMINI_API_KEY) {
      console.log('Falling back to image description with Gemini...');
      const prompt = buildImageDescriptionPrompt(description);
      // Use the imported generateContent function which has proper timeout handling
      try {
        const contentPromise = generateContent(prompt, description);
        const timeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Gemini fallback timeout after 20 seconds')), 20000)
        );
        
        const content = await Promise.race([contentPromise, timeoutPromise]);
        return content || '';
      } catch (error) {
        console.error('Gemini fallback failed:', error);
        return '';
      }
    }
    
    return image || '';
  } catch (error: any) {
    console.error('Image generation failed:', error);
    return '';
  }
}
