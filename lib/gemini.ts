import { GoogleGenerativeAI, Part, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || '');

// Safety settings to minimize blocking
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE }
];

// Get the Gemini 2.5 Flash model
export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 2048,
  }
});

export interface GeminiContent {
  text?: string;
  imageUrl?: string;
  imageData?: string; // base64 encoded image
}

export interface GeminiResponse {
  text: string;
  error?: string;
}

/**
 * Generate content using Gemini AI
 */
export async function generateContent(
  prompt: string,
  content?: GeminiContent
): Promise<GeminiResponse> {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error('GOOGLE_GENAI_API_KEY is not configured');
    }

    // Prepare content parts
    const parts: Part[] = [];

    // Add image if provided
    if (content?.imageUrl || content?.imageData) {
      let imageData = content.imageData;
      
      if (content.imageUrl && !imageData) {
        // Fetch image from URL and convert to base64
        const response = await fetch(content.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        imageData = Buffer.from(arrayBuffer).toString('base64');
      }

      if (imageData) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData
          }
        });
      }
    }

    // Add text content
    parts.push({ text: prompt });

    // Use the correct request format with safety settings
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts }],
      safetySettings
    });
    
    const response = await result.response;
    
    // Check for safety feedback
    if (response.promptFeedback?.blockReason) {
      throw new Error(`Response blocked: ${response.promptFeedback.blockReason}`);
    }
    
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response received');
    }

    return { text };
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Handle specific Gemini errors
    if (error instanceof Error) {
      if (error.message.includes('PROHIBITED_CONTENT') || error.message.includes('blocked')) {
        return {
          text: 'I apologize, but I cannot respond to that request due to content policy restrictions. Please try rephrasing your question.',
          error: 'Content policy restriction'
        };
      }
      
      if (error.message.includes('Empty response')) {
        return {
          text: 'I apologize, but I received an empty response. Please try asking something else.',
          error: 'Empty response'
        };
      }
    }
    
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate content with streaming support
 */
export async function* generateContentStream(
  prompt: string,
  content?: GeminiContent
): AsyncGenerator<string, void, unknown> {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      throw new Error('GOOGLE_GENAI_API_KEY is not configured');
    }

    // Prepare content parts
    const parts: Part[] = [];

    // Add image if provided
    if (content?.imageUrl || content?.imageData) {
      let imageData = content.imageData;
      
      if (content.imageUrl && !imageData) {
        const response = await fetch(content.imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        imageData = Buffer.from(arrayBuffer).toString('base64');
      }

      if (imageData) {
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageData
          }
        });
      }
    }

    // Add text content
    parts.push({ text: prompt });

    // Use the correct request format with safety settings
    const result = await geminiModel.generateContentStream({
      contents: [{ role: "user", parts }],
      safetySettings
    });

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        yield chunkText;
      }
    }
  } catch (error) {
    console.error('Gemini Stream Error:', error);
    throw error;
  }
}

/**
 * Validate API key
 */
export async function validateApiKey(): Promise<boolean> {
  try {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
      return false;
    }

    const result = await generateContent('Hello');
    return !result.error;
  } catch {
    return false;
  }
} 