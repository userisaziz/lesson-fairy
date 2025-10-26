const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return;
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
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Gemini API error:', error);
  }
}

testGemini();