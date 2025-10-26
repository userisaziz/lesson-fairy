export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not set' }, 
        { status: 500 }
      );
    }

    console.log('Testing Gemini API connection...');
    
    // Initialize with the new SDK syntax
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    console.log('Calling Gemini API with a simple test...');
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: "Say hello world",
      });
      
      const text = response.text;
      console.log('Gemini API response:', text);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Gemini API is working',
        response: text
      });
    } catch (apiError: any) {
      console.error('Gemini API error:', apiError);
      return NextResponse.json(
        { error: 'Gemini API test failed', details: apiError.message }, 
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in testGemini API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to test Gemini API' }, 
      { status: 500 }
    );
  }
}