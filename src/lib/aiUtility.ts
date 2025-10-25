import { GoogleGenAI } from "@google/genai";

// Add retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 3000; // 3 seconds

// Google Gemini integration 
export const generateWithGemini = async (prompt: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set');
  }
  
  let attempts = 0;
  
  while (attempts < MAX_RETRIES) {
    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: prompt,
      });
      
      // Ensure we return a string, even if empty
      const content = response.text || '';
      
      if (!content.trim()) {
        throw new Error('Gemini returned empty response');
      }
      
      return content;
    } catch (error: any) {
      attempts++;
      console.error(`Error generating with Gemini (attempt ${attempts}):`, error);
      
      // If this was the last attempt, re-throw the error
      if (attempts >= MAX_RETRIES) {
        throw new Error(`Gemini API error after ${MAX_RETRIES} attempts: ${error.message || 'Unknown error'}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempts));
    }
  }
  
  return ''; // This should never be reached
};

// Function to generate diagrams using Hugging Face
export const generateDiagramWithHuggingFace = async (description: string): Promise<string> => {
  try {
    console.log('Attempting Hugging Face diagram generation...');
    console.log('HUGGING_FACE_TOKEN set:', !!process.env.HUGGING_FACE_TOKEN);
    
    if (!process.env.HUGGING_FACE_TOKEN) {
      console.log('HUGGING_FACE_TOKEN is not set');
      throw new Error('HUGGING_FACE_TOKEN is not set');
    }

    // For diagrams, we'll generate an image and return it as a data URL
    // since Hugging Face doesn't directly generate SVG
    const imagePrompt = `Create an educational diagram for children about: "${description}".
    Requirements:
    1. Clear, simple educational diagram
    2. Bright, child-friendly colors
    3. Cartoon-style illustrations
    4. Simple labels and educational content
    5. Visually appealing and fun for kids
    6. Focus on the educational content`;

    console.log('Using prompt:', imagePrompt);

    // Use the new Inference Providers API endpoint with a text-to-image model
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: imagePrompt,
          options: {
            wait_for_model: true,
          },
        }),
      }
    );

    console.log('Hugging Face API response status:', response.status);
    
    // If we can't generate an image, return empty string
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
      
      // If it's a 429 (rate limit), we might want to retry
      if (response.status === 429) {
        throw new Error('Rate limit exceeded on Hugging Face API');
      }
      
      return '';
    }

    // Convert the response to a data URL
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    console.log('✅ Successfully generated diagram image with Hugging Face');
    return `data:image/jpeg;base64,${base64}`;
  } catch (error: any) {
    console.error('Error generating diagram with Hugging Face:', error);
    // Return empty string 
    throw new Error(`Failed to generate diagram: ${error.message}`);
  }
};

// Function to generate images using Hugging Face
export const generateImageWithHuggingFace = async (description: string): Promise<string> => {
  try {
    console.log('Attempting Hugging Face image generation...');
    console.log('HUGGING_FACE_TOKEN set:', !!process.env.HUGGING_FACE_TOKEN);
    
    if (!process.env.HUGGING_FACE_TOKEN) {
      console.log('HUGGING_FACE_TOKEN is not set');
      throw new Error('HUGGING_FACE_TOKEN is not set');
    }

    // Models to try in order of preference
    const models = [
      {
        name: "Stable Diffusion XL",
        id: "stabilityai/stable-diffusion-xl-base-1.0",
        prompt: `A child-friendly educational illustration showing ${description}, colorful, cartoon style, suitable for kids learning`
      },
      {
        name: "Stable Diffusion v1.5",
        id: "runwayml/stable-diffusion-v1-5",
        prompt: `A child-friendly educational illustration showing ${description}, colorful, cartoon style, suitable for kids learning`
      }
    ];

    // Try each model in sequence
    for (const model of models) {
      console.log(`Trying Hugging Face model: ${model.name}`);
      console.log('Using prompt:', model.prompt);

      try {
        // Use the new Inference Providers API endpoint
        const response = await fetch(
          `https://router.huggingface.co/hf-inference/models/${model.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: model.prompt,
              options: {
                wait_for_model: true,
              },
            }),
          }
        );

        console.log(`Hugging Face API response status for ${model.name}:`, response.status);

        if (response.status === 404) {
          console.log(`Model ${model.name} not found, trying next model...`);
          continue;
        }

        if (response.status === 403) {
          console.log(`Access forbidden for ${model.name}, trying next model...`);
          continue;
        }

        if (response.status === 429) {
          console.log(`Rate limit exceeded for ${model.name}, trying next model...`);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error with ${model.name}: ${response.status} ${response.statusText} - ${errorText}`);
          continue;
        }

        // Convert the response to a data URL
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        console.log(`✅ Successfully generated image with ${model.name}`);
        return `data:image/jpeg;base64,${base64}`;
      } catch (modelError) {
        console.error(`Error with ${model.name}:`, modelError);
        continue;
      }
    }
    
    // If we get here, all models failed
    console.log('All Hugging Face models failed to generate an image');
    return '';
  } catch (error: any) {
    console.error('Error generating image with Hugging Face:', error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
};