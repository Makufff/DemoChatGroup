import { Character, Message } from '@/types/chat';
import { generateContent } from '@/lib/gemini';

export interface DirectorContext {
  characters: Character[];
  messages: Message[];
  currentUserMessage: string;
  replyTo?: string; // Add replyTo to context
}

export interface DirectorDecision {
  shouldMultipleRespond: boolean;
  selectedCharacters: Character[];
  reason: string;
}

/**
 * AI Director Agent for character selection
 */
export class DirectorAgent {
  private static readonly DIRECTOR_PROMPT = `
You are an AI Director managing a group chat with multiple AI characters. Your job is to decide which character(s) should respond to the user's message.

Available characters:
{CHARACTERS}

Recent conversation context (last 5 messages):
{CONVERSATION_CONTEXT}

User's message: "{USER_MESSAGE}"

{REPLY_CONTEXT}

Instructions:
1. Analyze the user's message and conversation context
2. Consider each character's expertise, personality, and relevance to the topic
3. Decide if one character or multiple characters should respond
4. Keep responses family-friendly and educational
5. Respond with ONLY a JSON object in this exact format:
{
  "shouldMultipleRespond": true/false,
  "selectedCharacterIds": ["id1", "id2"],
  "reason": "Brief explanation of your decision"
}

Rules:
- If the user asks a general question or "what do you all think", have multiple characters respond
- If the question is specific to one character's expertise, have only that character respond
- If the user is replying to a specific character's message, have that character respond
- Keep the reason concise and clear

Respond with ONLY the JSON object:
`;

  /**
   * Decide which character(s) should respond
   */
  static async decideResponse(context: DirectorContext): Promise<DirectorDecision> {
    try {
      // Check if this is a reply to a specific character
      if (context.replyTo) {
        const repliedMessage = context.messages.find(msg => msg.id === context.replyTo);
        if (repliedMessage && repliedMessage.characterId) {
          const repliedCharacter = context.characters.find(char => char.id === repliedMessage.characterId);
          if (repliedCharacter) {
            return {
              shouldMultipleRespond: false,
              selectedCharacters: [repliedCharacter],
              reason: `User is replying to ${repliedCharacter.name}'s message, so ${repliedCharacter.name} should respond.`
            };
          }
        }
      }

      // Normal decision logic for non-reply messages
      const prompt = this.buildDirectorPrompt(context);
      const response = await generateContent(prompt);
      
      if (response.error) {
        console.error('Director decision error:', response.error);
        // Fallback: select first character
        return {
          shouldMultipleRespond: false,
          selectedCharacters: context.characters.slice(0, 1),
          reason: 'Fallback: Using first available character due to error'
        };
      }

      const decision = this.parseDirectorResponse(response.text);
      
      // Validate and find the selected characters
      const selectedCharacters = context.characters.filter(char => 
        decision.selectedCharacterIds.includes(char.id)
      );

      if (selectedCharacters.length === 0) {
        // Fallback: select first character
        return {
          shouldMultipleRespond: false,
          selectedCharacters: context.characters.slice(0, 1),
          reason: 'Fallback: No valid characters selected, using first available'
        };
      }

      return {
        shouldMultipleRespond: decision.shouldMultipleRespond,
        selectedCharacters,
        reason: decision.reason
      };

    } catch (error) {
      console.error('Director decision error:', error);
      // Fallback: select first character
      return {
        shouldMultipleRespond: false,
        selectedCharacters: context.characters.slice(0, 1),
        reason: 'Fallback: Error in director decision, using first available character'
      };
    }
  }

  /**
   * Build director prompt
   */
  private static buildDirectorPrompt(context: DirectorContext): string {
    const characterList = context.characters
      .map(char => `- ${char.name} (ID: ${char.id}): ${char.description}`)
      .join('\n');

    const recentMessages = context.messages
      .slice(-5)
      .map(msg => {
        if (msg.role === 'user') {
          return `User: ${msg.content}`;
        } else if (msg.role === 'assistant' && msg.characterId) {
          const character = context.characters.find(c => c.id === msg.characterId);
          return `${character?.name || 'Unknown'}: ${msg.content}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');

    // Add reply context if this is a reply
    let replyContext = '';
    if (context.replyTo) {
      const repliedMessage = context.messages.find(msg => msg.id === context.replyTo);
      if (repliedMessage && repliedMessage.characterId) {
        const repliedCharacter = context.characters.find(char => char.id === repliedMessage.characterId);
        replyContext = `\n\nIMPORTANT: The user is replying to a message from ${repliedCharacter?.name || 'Unknown'}. ${repliedCharacter?.name || 'This character'} should respond to maintain conversation continuity.`;
      }
    }

    return this.DIRECTOR_PROMPT
      .replace('{CHARACTERS}', characterList)
      .replace('{CONVERSATION_CONTEXT}', recentMessages || 'No recent messages')
      .replace('{USER_MESSAGE}', context.currentUserMessage)
      .replace('{REPLY_CONTEXT}', replyContext);
  }

  /**
   * Parse director response
   */
  private static parseDirectorResponse(responseText: string): {
    shouldMultipleRespond: boolean;
    selectedCharacterIds: string[];
    reason: string;
  } {
    try {
      // Clean the response text
      const cleanedText = this.cleanResponseText(responseText);
      const decision = JSON.parse(cleanedText);
      
      return {
        shouldMultipleRespond: decision.shouldMultipleRespond || false,
        selectedCharacterIds: decision.selectedCharacterIds || [],
        reason: decision.reason || 'No reason provided'
      };
    } catch (error) {
      console.error('Failed to parse director response:', error);
      console.error('Raw response:', responseText);
      throw new Error('Invalid director response format');
    }
  }

  /**
   * Clean response text by removing markdown and extra text
   */
  private static cleanResponseText(text: string): string {
    // Remove markdown code blocks
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find the JSON object
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    
    return cleaned.trim();
  }
} 