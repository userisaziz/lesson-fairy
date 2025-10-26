import { GoogleGenAI, ApiError } from "@google/genai";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 45000; // 45 seconds to work with Vercel's 60s limit

/**
 * Production-ready Gemini content generation with proper error handling
 */
export const generateWithGemini = async (prompt: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  console.log(`[Gemini] Starting generation (prompt: ${prompt.length} chars)`);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Gemini] Attempt ${attempt}/${MAX_RETRIES}`);

      const result = await executeWithTimeout(
        async () => {
          console.log(`[Gemini] Calling API...`);
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Using stable model
            contents: prompt,
          });
          console.log(`[Gemini] API responded`);
          return response;
        },
        REQUEST_TIMEOUT,
        `Gemini API timeout (${REQUEST_TIMEOUT}ms)`
      );

      // Extract text from response
      const text = extractTextFromResponse(result);
      
      if (!text || text.trim().length === 0) {
        throw new Error("Empty response from Gemini");
      }

      console.log(`[Gemini] ✅ Success (${text.length} chars)`);
      return text;

    } catch (error: any) {
      console.error(`[Gemini] ❌ Attempt ${attempt} failed:`, error.message);

      // Don't retry on auth/permission errors
      if (isNonRetryableError(error)) {
        console.error(`[Gemini] Non-retryable error, failing immediately`);
        throw new Error(`Gemini API error: ${error.message}`);
      }

      // If this was the last attempt, throw
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Gemini failed after ${MAX_RETRIES} attempts: ${error.message}`
        );
      }

      // Wait before retry with exponential backoff
      const waitTime = RETRY_DELAY * attempt;
      console.log(`[Gemini] Retrying in ${waitTime}ms...`);
      await sleep(waitTime);
    }
  }

  throw new Error("Gemini generation failed");
};

/**
 * Execute a promise with a timeout
 */
async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      console.log(`[Timeout] Triggered after ${timeoutMs}ms`);
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([fn(), timeoutPromise]);
    clearTimeout(timeoutHandle!);
    return result;
  } catch (error) {
    clearTimeout(timeoutHandle!);
    throw error;
  }
}

/**
 * Extract text from various Gemini response formats
 */
function extractTextFromResponse(response: any): string {
  try {
    // Method 1: Direct text property
    if (response.text) {
      return typeof response.text === "function" ? response.text() : response.text;
    }

    // Method 2: Candidates structure
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.candidates[0].content.parts[0].text;
    }

    // Method 3: Response structure
    if (response.response?.text) {
      return typeof response.response.text === "function" 
        ? response.response.text() 
        : response.response.text;
    }

    console.error("[Gemini] Unexpected response structure:", 
      JSON.stringify(response).substring(0, 500));
    throw new Error("Could not extract text from response");
  } catch (error: any) {
    console.error("[Gemini] Text extraction failed:", error.message);
    throw new Error(`Failed to parse response: ${error.message}`);
  }
}

/**
 * Check if error should not be retried
 */
function isNonRetryableError(error: any): boolean {
  // API errors with specific status codes
  if (error instanceof ApiError) {
    const nonRetryableStatuses = [400, 401, 403, 404];
    if (nonRetryableStatuses.includes(error.status)) {
      return true;
    }
  }

  // Check error message for non-retryable patterns
  const message = error.message?.toLowerCase() || "";
  const nonRetryablePatterns = [
    "api key",
    "authentication",
    "permission",
    "invalid",
    "not found",
  ];

  return nonRetryablePatterns.some(pattern => message.includes(pattern));
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fallback: Direct REST API call (if SDK fails)
 */
export const generateWithGeminiREST = async (prompt: string): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  console.log(`[Gemini REST] Starting generation`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-0827:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No text in response");
    }

    console.log(`[Gemini REST] ✅ Success`);
    return text;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === "AbortError") {
      throw new Error("Request timeout");
    }
    
    throw error;
  }
};

// ============================================================================
// HUGGING FACE FUNCTIONS (Optimized for Production)
// ============================================================================

const HF_TIMEOUT = 30000;
const HF_MAX_RETRIES = 2;

/**
 * Generate diagram with Hugging Face (production-ready)
 */
export const generateDiagramWithHuggingFace = async (
  description: string
): Promise<string> => {
  if (!process.env.HUGGING_FACE_TOKEN) {
    throw new Error("HUGGING_FACE_TOKEN is not set");
  }

  console.log(`[HF Diagram] Starting generation`);

  const prompt = `Educational diagram for children: ${description}. 
Clear, simple, bright colors, cartoon style, labeled, fun, educational.`;

  return await generateHFImage(prompt, "diagram");
};

/**
 * Generate image with Hugging Face (production-ready)
 */
export const generateImageWithHuggingFace = async (
  description: string
): Promise<string> => {
  if (!process.env.HUGGING_FACE_TOKEN) {
    throw new Error("HUGGING_FACE_TOKEN is not set");
  }

  console.log(`[HF Image] Starting generation`);

  const prompt = `Child-friendly educational illustration: ${description}. 
Colorful, cartoon style, suitable for kids learning.`;

  return await generateHFImage(prompt, "image");
};

/**
 * Core Hugging Face image generation with retry logic
 */
async function generateHFImage(
  prompt: string,
  type: "diagram" | "image"
): Promise<string> {
  const models = [
    "stabilityai/stable-diffusion-xl-base-1.0",
    "runwayml/stable-diffusion-v1-5",
  ];

  for (let attempt = 1; attempt <= HF_MAX_RETRIES; attempt++) {
    for (const model of models) {
      try {
        console.log(`[HF ${type}] Attempt ${attempt}, Model: ${model}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), HF_TIMEOUT);

        const response = await fetch(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
            body: JSON.stringify({
              inputs: prompt,
              options: { wait_for_model: true },
            }),
          }
        );

        clearTimeout(timeoutId);

        // Skip to next model on certain errors
        if (response.status === 404 || response.status === 403) {
          console.log(`[HF ${type}] Model ${model} not accessible, trying next`);
          continue;
        }

        if (response.status === 429) {
          console.log(`[HF ${type}] Rate limited on ${model}`);
          if (attempt < HF_MAX_RETRIES) {
            await sleep(2000 * attempt);
            continue;
          }
          throw new Error("Rate limit exceeded");
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[HF ${type}] Error: ${response.status} - ${errorText}`);
          continue;
        }

        // Convert to base64
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        
        console.log(`[HF ${type}] ✅ Success with ${model}`);
        return `data:image/jpeg;base64,${base64}`;

      } catch (error: any) {
        console.error(`[HF ${type}] Error with ${model}:`, error.message);
        
        if (error.name === "AbortError") {
          console.log(`[HF ${type}] Timeout on ${model}`);
        }
        
        // Try next model
        continue;
      }
    }

    // Wait before full retry
    if (attempt < HF_MAX_RETRIES) {
      await sleep(2000 * attempt);
    }
  }

  throw new Error(`Failed to generate ${type} after ${HF_MAX_RETRIES} attempts`);
}

/**
 * Health check for APIs
 */
export async function checkAPIHealth(): Promise<{
  gemini: boolean;
  huggingFace: boolean;
}> {
  const results = {
    gemini: false,
    huggingFace: false,
  };

  // Check Gemini
  try {
    await generateWithGemini("Say 'OK'");
    results.gemini = true;
  } catch (error) {
    console.error("[Health] Gemini check failed");
  }

  // Check Hugging Face
  try {
    if (process.env.HUGGING_FACE_TOKEN) {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`,
          },
        }
      );
      results.huggingFace = response.status !== 403;
    }
  } catch (error) {
    console.error("[Health] HuggingFace check failed");
  }

  return results;
}