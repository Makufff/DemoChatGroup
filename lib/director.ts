import { Character, Message } from '@/types/chat';
import { generateContent } from '@/lib/gemini';

export interface DirectorContext {
  characters: Character[];
  messages: Message[];
  currentUserMessage: string;
}

export interface DirectorResponse {
  shouldMultipleRespond: boolean;
  selectedCharacters: Character[];
  reason: string;
}

/**
 * Director Agent - Decides which character should reply based on context
 */
export class DirectorAgent {
  private static readonly DIRECTOR_PROMPT = `
You are a Director Agent managing a group chat with multiple AI characters. Your job is to decide which character(s) should respond to the user's message.

Available characters:
{CHARACTERS}

Recent conversation context:
{CONTEXT}

User's message: "{USER_MESSAGE}"

Analyze the user's message and decide who should respond. Consider:
1. If the user asks for "everyone's opinion", "all thoughts", "what do you all think", etc. → ALL characters should respond
2. If the user asks a specific question that matches one character's expertise → that character should respond
3. If the user asks a general question → choose the most suitable character
4. If multiple characters have relevant expertise → choose the most appropriate one

IMPORTANT: Respond with ONLY a JSON object, no markdown formatting, no code blocks, no explanations outside the JSON. Keep responses family-friendly and educational.

{
  "shouldMultipleRespond": true/false,
  "selectedCharacterIds": ["id1", "id2"] or ["id1"],
  "reason": "brief explanation of the decision"
}

If shouldMultipleRespond is true, include ALL character IDs. If false, include only ONE character ID.
`;

  /**
   * Clean response text to extract JSON
   */
  private static cleanResponseText(text: string): string {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Remove any text before the first {
    const jsonStart = cleaned.indexOf('{');
    if (jsonStart > 0) {
      cleaned = cleaned.substring(jsonStart);
    }
    
    // Remove any text after the last }
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonEnd >= 0 && jsonEnd < cleaned.length - 1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }
    
    return cleaned.trim();
  }

  /**
   * Decide which character(s) should respond
   */
  static async decideResponse(context: DirectorContext): Promise<DirectorResponse> {
    try {
      const prompt = this.buildPrompt(context);
      const response = await generateContent(prompt);
      
      if (response.error) {
        console.error('Director decision error:', response.error);
        return this.fallbackDecision(context);
      }

      try {
        const cleanedText = this.cleanResponseText(response.text);
        const decision = JSON.parse(cleanedText) as {
          shouldMultipleRespond: boolean;
          selectedCharacterIds: string[];
          reason: string;
        };
        
        // Validate the decision
        if (this.isValidDecision(decision, context.characters)) {
          const selectedCharacters = context.characters.filter(char => 
            decision.selectedCharacterIds.includes(char.id)
          );
          
          return {
            shouldMultipleRespond: decision.shouldMultipleRespond,
            selectedCharacters,
            reason: decision.reason
          };
        }
      } catch (parseError) {
        console.error('Failed to parse director decision:', parseError);
        console.error('Raw response:', response.text);
      }

      return this.fallbackDecision(context);
    } catch (error) {
      console.error('Director decision failed:', error);
      return this.fallbackDecision(context);
    }
  }

  /**
   * Build the prompt for the director
   */
  private static buildPrompt(context: DirectorContext): string {
    const charactersText = context.characters
      .map(char => `- ${char.name} (ID: ${char.id}): ${char.description}`)
      .join('\n');

    const recentMessages = context.messages
      .slice(-5) // Last 5 messages for context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Character'}: ${msg.content}`)
      .join('\n');

    return this.DIRECTOR_PROMPT
      .replace('{CHARACTERS}', charactersText)
      .replace('{CONTEXT}', recentMessages || 'No recent messages')
      .replace('{USER_MESSAGE}', context.currentUserMessage);
  }

  /**
   * Validate the director's decision
   */
  private static isValidDecision(decision: unknown, characters: Character[]): boolean {
    if (typeof decision !== 'object' || decision === null) return false;
    
    const d = decision as Record<string, unknown>;
    
    return (
      'shouldMultipleRespond' in d &&
      'selectedCharacterIds' in d &&
      'reason' in d &&
      typeof d.shouldMultipleRespond === 'boolean' &&
      Array.isArray(d.selectedCharacterIds) &&
      typeof d.reason === 'string' &&
      (d.selectedCharacterIds as string[]).length > 0 &&
      (d.selectedCharacterIds as string[]).every((id: string) => 
        characters.some(char => char.id === id)
      )
    );
  }

  /**
   * Fallback decision when AI fails
   */
  private static fallbackDecision(context: DirectorContext): DirectorResponse {
    // Check if user is asking for everyone's opinion
    const userMessage = context.currentUserMessage.toLowerCase();
    const groupKeywords = ['everyone', 'all', 'everybody', 'what do you all think', 'all thoughts', 'everyone\'s opinion'];
    
    const isGroupQuestion = groupKeywords.some(keyword => userMessage.includes(keyword));
    
    if (isGroupQuestion) {
      return {
        shouldMultipleRespond: true,
        selectedCharacters: context.characters,
        reason: 'User asked for everyone\'s opinion'
      };
    }

    // Default to first character
    return {
      shouldMultipleRespond: false,
      selectedCharacters: [context.characters[0]],
      reason: 'Fallback selection: first character'
    };
  }

  /**
   * Check if message is asking for group response
   */
  static isGroupQuestion(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const groupKeywords = [
      'everyone', 'all', 'everybody', 'what do you all think', 
      'all thoughts', 'everyone\'s opinion', 'what do you think',
      'all of you', 'everyone here', 'group opinion'
    ];
    
    return groupKeywords.some(keyword => lowerMessage.includes(keyword));
  }
} 