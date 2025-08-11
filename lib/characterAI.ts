import { Character, Message } from '@/types/chat';
import { generateContent, generateContentStream } from '@/lib/gemini';

export interface CharacterResponse {
  content: string;
  characterId: string;
  error?: string;
}

/**
 * AI Character Response Generator
 */
export class CharacterAI {
  private static readonly CHARACTER_PROMPT_TEMPLATE = `
You are {CHARACTER_NAME}, {CHARACTER_DESCRIPTION}

You are participating in a group chat with other characters. Respond to the user's message in character, maintaining your unique personality, expertise, and speaking style.

Recent conversation context:
{CONVERSATION_CONTEXT}

User's message: "{USER_MESSAGE}"

Instructions:
1. Stay in character at all times
2. Use your unique perspective and expertise
3. Keep responses concise but informative
4. If the topic is outside your expertise, acknowledge it and suggest who might know better
5. Be engaging and conversational
6. Don't break character or mention that you're an AI
7. Keep responses family-friendly and educational
8. Focus on positive, constructive interactions

Respond naturally as {CHARACTER_NAME}:
`;

  /**
   * Generate a character response
   */
  static async generateResponse(
    character: Character,
    userMessage: string,
    conversationContext: Message[]
  ): Promise<CharacterResponse> {
    try {
      const prompt = this.buildCharacterPrompt(character, userMessage, conversationContext);
      const response = await generateContent(prompt);
      
      if (response.error) {
        // Provide fallback response based on character type
        const fallbackResponse = this.getFallbackResponse(character, userMessage);
        return {
          content: fallbackResponse,
          characterId: character.id
        };
      }

      return {
        content: response.text.trim(),
        characterId: character.id
      };
    } catch (error) {
      console.error(`Character AI error for ${character.name}:`, error);
      const fallbackResponse = this.getFallbackResponse(character, userMessage);
      return {
        content: fallbackResponse,
        characterId: character.id
      };
    }
  }

  /**
   * Generate a streaming character response
   */
  static async* generateStreamingResponse(
    character: Character,
    userMessage: string,
    conversationContext: Message[]
  ): AsyncGenerator<string, void, unknown> {
    try {
      const prompt = this.buildCharacterPrompt(character, userMessage, conversationContext);
      
      for await (const chunk of generateContentStream(prompt)) {
        yield chunk;
      }
    } catch (error) {
      console.error(`Character AI streaming error for ${character.name}:`, error);
      throw error;
    }
  }

  /**
   * Build character-specific prompt
   */
  private static buildCharacterPrompt(
    character: Character,
    userMessage: string,
    conversationContext: Message[]
  ): string {
    const recentMessages = conversationContext
      .slice(-10) // Last 10 messages for context
      .map(msg => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant' && msg.characterId) {
          return `${character.name}: ${msg.content}`;
        } else if (msg.role === 'director') {
          return `Director: ${msg.content}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');

    return this.CHARACTER_PROMPT_TEMPLATE
      .replace('{CHARACTER_NAME}', character.name)
      .replace('{CHARACTER_DESCRIPTION}', character.description)
      .replace('{CONVERSATION_CONTEXT}', recentMessages || 'No recent messages')
      .replace('{USER_MESSAGE}', userMessage);
  }

  /**
   * Generate a collaborative response from multiple characters
   */
  static async generateCollaborativeResponse(
    characters: Character[],
    userMessage: string,
    conversationContext: Message[]
  ): Promise<CharacterResponse[]> {
    const responses: CharacterResponse[] = [];
    
    // Generate responses from all characters
    const responsePromises = characters.map(character =>
      this.generateResponse(character, userMessage, conversationContext)
    );
    
    const results = await Promise.allSettled(responsePromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        responses.push(result.value);
      } else {
        responses.push({
          content: '',
          characterId: characters[index].id,
          error: result.reason?.message || 'Failed to generate response'
        });
      }
    });
    
    return responses;
  }

  /**
   * Generate a character introduction message
   */
  static async generateIntroduction(character: Character): Promise<string> {
    const prompt = `
You are ${character.name}, ${character.description}

Generate a brief, engaging introduction of yourself (1-2 sentences) that you would say when joining a conversation. Make it natural and in character.

Introduction:
`;

    try {
      const response = await generateContent(prompt);
      return response.text.trim();
    } catch {
      return `Hello! I'm ${character.name}. ${character.description}`;
    }
  }

  /**
   * Check if a character should respond to a specific message
   */
  static async shouldCharacterRespond(
    character: Character,
    userMessage: string
  ): Promise<boolean> {
    const prompt = `
You are ${character.name}, ${character.description}

The user said: "${userMessage}"

Based on your expertise and personality, should you respond to this message? Consider:
1. Is this topic within your area of expertise?
2. Do you have a unique perspective to offer?
3. Would your response add value to the conversation?

Respond with ONLY "yes" or "no".
`;

    try {
      const response = await generateContent(prompt);
      return response.text.toLowerCase().trim() === 'yes';
    } catch {
      // Default to responding if we can't determine
      return true;
    }
  }

  /**
   * Get fallback response when AI fails
   */
  private static getFallbackResponse(character: Character, userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for common question types
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm ${character.name}. ${character.description}`;
    }
    
    if (lowerMessage.includes('how are you')) {
      return `I'm doing well, thank you for asking! As ${character.name}, I'm always eager to share my knowledge and insights.`;
    }
    
    if (lowerMessage.includes('what do you think') || lowerMessage.includes('opinion')) {
      return `That's an interesting question! From my perspective as ${character.name}, I'd need to think about this more carefully. Could you provide more context?`;
    }
    
    // Default fallback
    return `I appreciate your question! As ${character.name}, I find this topic quite fascinating. ${character.description} Perhaps we could explore this further?`;
  }
} 