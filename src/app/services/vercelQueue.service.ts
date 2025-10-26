import { LessonContent } from "@/types/lesson";
import { generateDiagramWithHuggingFace, generateImageWithHuggingFace } from "@/lib/aiUtility";
import { buildImageDescriptionPrompt, buildLessonPrompt } from "./buildLessonPrompt.service";
import { updateLessonError, updateLessonRecord, getLesson, updateLessonContent } from "./database.service";
import { cleanJsonString, logGenerationResult } from "@/lib/utilityFunctions";
import { generateContent } from "./contentGenerationService";

export class VercelLessonQueue {
  private static instance: VercelLessonQueue;

  private constructor() {}

  static getInstance(): VercelLessonQueue {
    if (!VercelLessonQueue.instance) {
      VercelLessonQueue.instance = new VercelLessonQueue();
    }
    return VercelLessonQueue.instance;
  }

  async processStep(lessonId: string, step: string, outline: string): Promise<any> {
    switch (step) {
      case 'generateContent':
        return this._generateContent(lessonId, outline);
      case 'parseAndSaveContent':
        const lesson = await getLesson(lessonId);
        if (!lesson.raw_content) throw new Error('Raw content not found');
        return this._parseAndSaveContent(lessonId, lesson.raw_content);
      case 'generateVisuals':
        const lessonWithContent = await getLesson(lessonId);
        if (!lessonWithContent.json_content) throw new Error('Lesson content not found');
        return this._generateAllVisuals(lessonId, lessonWithContent.json_content);
      case 'finalize':
        return this._finalizeLesson(lessonId);
      default:
        throw new Error(`Unknown step: ${step}`);
    }
  }

  private async _generateContent(lessonId: string, outline: string): Promise<void> {
    console.log(`[Step 1] Generating content for lesson ${lessonId}`);
    const prompt = buildLessonPrompt(outline);
    const rawContent = await generateContent(prompt, outline);
    await updateLessonRecord(lessonId, { raw_content: rawContent, progress: 10 });
  }

  private async _parseAndSaveContent(lessonId: string, rawContent: string): Promise<void> {
    console.log(`[Step 2] Parsing content for lesson ${lessonId}`);
    const parsedContent = this._parseAndValidateContent(rawContent);
    this._postProcessContent(parsedContent);
    await updateLessonRecord(lessonId, { json_content: parsedContent, progress: 30 });
  }

  private async _generateAllVisuals(lessonId: string, content: LessonContent): Promise<void> {
    console.log(`[Step 3] Generating visuals for lesson ${lessonId}`);
    if (!content.content.sections) return;

    for (let i = 0; i < content.content.sections.length; i++) {
      const section = content.content.sections[i];
      if (section.visuals?.description) {
        const visual = await this._generateVisual(section.visuals);
        section.generatedVisual = visual || '';
      }
    }

    await updateLessonContent(lessonId, content);
    await updateLessonRecord(lessonId, { progress: 90 });
  }

  private async _finalizeLesson(lessonId: string): Promise<void> {
    console.log(`[Step 4] Finalizing lesson ${lessonId}`);
    await updateLessonRecord(lessonId, { status: 'generated', progress: 100 });
  }

  private _parseAndValidateContent(rawContent: string): LessonContent {
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

  private _postProcessContent(content: LessonContent): void {
    if (content.content?.sections) {
      for (const section of content.content.sections) {
        if (section.codeExample && (!section.codeExample.code || section.codeExample.code.trim() === '')) {
          delete section.codeExample;
        }
      }
    }
  }

  private async _generateVisual(visualConfig: { description: string; type: string }): Promise<string> {
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
      
      try {
        const content = await generateContent(prompt, description);
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
