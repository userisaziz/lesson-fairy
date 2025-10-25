import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Testing environment variables in API route');
  console.log('HUGGING_FACE_TOKEN available:', !!process.env.HUGGING_FACE_TOKEN);
  console.log('GEMINI_API_KEY available:', !!process.env.GEMINI_API_KEY);
  
  return NextResponse.json({
    huggingFaceTokenAvailable: !!process.env.HUGGING_FACE_TOKEN,
    geminiApiKeyAvailable: !!process.env.GEMINI_API_KEY,
    message: 'Environment variable test complete'
  });
}