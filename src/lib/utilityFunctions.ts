import { LessonContent } from "@/types/lesson";

export function cleanJsonString(content: string): string {
  let cleaned = content.trim();
  
  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  
  return cleaned;
}

export function extractFirstDiagram(content: LessonContent): string | null {
  const firstSection = content.content.sections?.[0];
  return firstSection?.generatedVisual || null;
}

export function logGenerationResult(provider: string, content: string) {
  console.log('==========================================');
  console.log('Provider used:', provider);
  console.log('Generated content length:', content.length);
  console.log('Generated content preview:', content.substring(0, 200) + '...');
  console.log('==========================================');
}