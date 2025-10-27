import { LessonContent } from "@/types/lesson";

export function cleanJsonString(content: string): string {
  let cleaned = content.trim();
  
  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  
  // Remove any trailing commas before closing braces/brackets (common AI error)
  cleaned = cleaned.replace(/,\s*}(\s*)/g, '}');
  cleaned = cleaned.replace(/,\s*](\s*)/g, ']');
  
  // Remove any text before the first '{' (in case AI includes explanations)
  const firstBraceIndex = cleaned.indexOf('{');
  if (firstBraceIndex > 0) {
    cleaned = cleaned.substring(firstBraceIndex);
  }
  
  // Remove any text after the last '}' (in case AI includes explanations)
  const lastBraceIndex = cleaned.lastIndexOf('}');
  if (lastBraceIndex >= 0 && lastBraceIndex < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBraceIndex + 1);
  }
  
  // Fix common escape sequence issues
  cleaned = cleaned.replace(/\\n/g, '\\n');
  cleaned = cleaned.replace(/\\t/g, '\\t');
  cleaned = cleaned.replace(/\\r/g, '\\r');
  
  // Fix unescaped quotes inside strings (common AI error)
  // This is a simplified fix - in a real scenario, we'd need a proper JSON parser
  cleaned = fixUnescapedQuotes(cleaned);
  
  return cleaned;
}

function fixUnescapedQuotes(jsonStr: string): string {
  // This is a heuristic to fix unescaped quotes in JSON strings
  // It's not perfect but handles common cases
  
  let result = '';
  let inString = false;
  let escapeNext = false;
  
  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if (char === '"' && inString) {
      // Closing quote
      inString = false;
      result += char;
    } else if (char === '"') {
      // Opening quote
      inString = true;
      result += char;
    } else if (char === '"' && inString) {
      // Unescaped quote inside string - escape it
      result += '\\"';
    } else {
      result += char;
    }
  }
  
  return result;
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