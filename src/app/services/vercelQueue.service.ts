// This service handles lesson generation using Vercel's infrastructure
// It's designed to work within Vercel's timeout constraints

import { LessonContent } from "@/types/lesson";
import { generateDiagramWithHuggingFace, generateImageWithHuggingFace, generateWithGemini } from "@/lib/aiUtility";
import { buildImageDescriptionPrompt, buildLessonPrompt } from "./buildLessonPrompt.service";
import { updateLessonError, updateLessonRecord } from "./database.service";
import { cleanJsonString, logGenerationResult } from "@/lib/utilityFunctions";

// Reduced retry configuration for Vercel compatibility
const MAX_RETRIES = 1; // Minimal retries to stay within timeout limits
const RETRY_DELAY = 500; // Short delay

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
  private queue: Map<string, QueueItem> = new Map();

  private constructor() {}

  static getInstance(): VercelLessonQueue {
    if (!VercelLessonQueue.instance) {
      VercelLessonQueue.instance = new VercelLessonQueue();
    }
    return VercelLessonQueue.instance;
  }

  // Add a lesson to the queue
  async addLesson(lessonId: string, outline: string): Promise<void> {
    this.queue.set(lessonId, {
      id: lessonId,
      status: 'pending',
      progress: 0,
      outline,
      createdAt: new Date().toISOString()
    });
  }

  // Get lesson status
  getLessonStatus(lessonId: string): QueueItem | null {
    return this.queue.get(lessonId) || null;
  }

  // Process a lesson (designed to work within Vercel timeout limits)
  async processLesson(lessonId: string): Promise<void> {
    const item = this.queue.get(lessonId);
    if (!item || item.status !== 'pending') {
      return;
    }

    try {
      // Update status to processing
      item.status = 'processing';
      item.progress = 10;

      // Step 1: Generate main content (with minimal retries)
      const prompt = buildLessonPrompt(item.outline);
      const rawContent = await this.generateContent(prompt, item.outline);
      const parsedContent = this.parseAndValidateContent(rawContent);
      
      // Post-process content
      this.postProcessContent(parsedContent);
      
      // Update progress
      item.progress = 30;
      
      // Save initial content to database
      await updateLessonRecord(lessonId, parsedContent, 'generating');
      
      // Update progress
      item.progress = 50;
      
      // Step 2: Generate visuals (minimal processing to stay within limits)
      await this.enrichContentWithVisuals(lessonId, parsedContent, item);
      
      // Update progress
      item.progress = 90;
      
      // Final update
      await updateLessonRecord(lessonId, parsedContent, 'generated');
      
      // Mark as completed
      item.status = 'completed';
      item.progress = 100;
      
      console.log(`Lesson ${lessonId} processed successfully`);
    } catch (error: any) {
      console.error(`Error processing lesson ${lessonId}:`, error);
      item.status = 'failed';
      item.errorMessage = error.message || 'Unknown error';
      item.progress = 100; // Mark as complete even on failure
      
      // Update database with error
      await updateLessonError(lessonId, item.errorMessage || 'Unknown error');
    }
  }

  private async generateContent(prompt: string, outline: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Generating content with Gemini...');
    
    try {
      const content = await generateWithGemini(prompt);
      
      if (!content?.trim()) {
        throw new Error('Gemini returned empty response');
      }

      console.log('✓ Gemini generation succeeded');
      return content;
    } catch (error: any) {
      console.error(`Gemini generation failed:`, error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
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

  private async enrichContentWithVisuals(lessonId: string, content: LessonContent, item: QueueItem) {
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
        
        // Update progress
        item.progress = 50 + Math.floor((i / sectionsToProcess.length) * 40);
        
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
      image = await generateWithGemini(prompt);
    }
    
    return image || '';
  } catch (error: any) {
    console.error('Image generation failed:', error);
    return '';
  }
}