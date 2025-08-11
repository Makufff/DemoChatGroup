import { NextRequest, NextResponse } from 'next/server';
import { DirectorAgent, DirectorContext } from '@/lib/director';
import { CharacterAI } from '@/lib/characterAI';
import { generateContent } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, userMessage, characters, messages, imageData, replyTo } = body;

    if (!roomId || (!userMessage && !imageData) || !characters || !Array.isArray(characters)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create director context
    const context: DirectorContext = {
      characters,
      messages: messages || [],
      currentUserMessage: userMessage || 'Please analyze this image',
      replyTo
    };

    // Get director's decision (behind the scenes)
    const directorDecision = await DirectorAgent.decideResponse(context);
    
    // Generate responses based on director's decision
    const responses = [];

    if (directorDecision.shouldMultipleRespond) {
      // Multiple characters should respond
      for (const character of directorDecision.selectedCharacters) {
        let characterResponse;
        
        if (imageData) {
          // Use multimodal approach for image analysis
          const prompt = `You are ${character.name}, ${character.description}

You are participating in a group chat. The user has shared an image and asked for everyone's opinion. Please analyze the image and respond in character, maintaining your unique personality and expertise.

User's message: "${userMessage || 'Please analyze this image'}"

Instructions:
1. Stay in character at all times
2. Analyze the image from your unique perspective
3. Use your expertise to provide insights about the image
4. Keep responses concise but informative
5. Be engaging and conversational
6. Don't break character or mention that you're an AI

Respond naturally as ${character.name}:`;

          const response = await generateContent(prompt, { imageData });
          
          if (response.error) {
            characterResponse = {
              content: `Sorry, I encountered an error processing your request.`,
              characterId: character.id,
              error: response.error
            };
          } else {
            characterResponse = {
              content: response.text.trim(),
              characterId: character.id,
              error: undefined
            };
          }
        } else {
          // Use regular character response for text-only messages
          characterResponse = await CharacterAI.generateResponse(
            character,
            userMessage,
            messages || [],
            replyTo
          );
        }

        responses.push({
          content: characterResponse.content,
          characterId: characterResponse.characterId,
          characterName: character.name
        });
      }
    } else {
      // Single character should respond
      const selectedCharacter = directorDecision.selectedCharacters[0];
      
      if (!selectedCharacter) {
        return NextResponse.json(
          { error: 'No character selected' },
          { status: 400 }
        );
      }

      let characterResponse;
      if (imageData) {
        // Use multimodal approach for image analysis
        const prompt = `You are ${selectedCharacter.name}, ${selectedCharacter.description}

You are participating in a group chat. The user has shared an image with you. Please analyze the image and respond in character, maintaining your unique personality and expertise.

User's message: "${userMessage || 'Please analyze this image'}"

Instructions:
1. Stay in character at all times
2. Analyze the image from your unique perspective
3. Use your expertise to provide insights about the image
4. Keep responses concise but informative
5. Be engaging and conversational
6. Don't break character or mention that you're an AI

Respond naturally as ${selectedCharacter.name}:`;

        const response = await generateContent(prompt, { imageData });
        
        if (response.error) {
          return NextResponse.json(
            { error: `Character response failed: ${response.error}` },
            { status: 500 }
          );
        }

        characterResponse = {
          content: response.text.trim(),
          characterId: selectedCharacter.id,
          error: undefined
        };
      } else {
        // Use regular character response for text-only messages
        characterResponse = await CharacterAI.generateResponse(
          selectedCharacter,
          userMessage,
          messages || [],
          replyTo
        );
      }

      if (characterResponse.error) {
        return NextResponse.json(
          { error: `Character response failed: ${characterResponse.error}` },
          { status: 500 }
        );
      }

      responses.push({
        content: characterResponse.content,
        characterId: characterResponse.characterId,
        characterName: selectedCharacter.name
      });
    }

    // Return the response (no director message shown to user)
    return NextResponse.json({
      responses,
      directorDecision: {
        shouldMultipleRespond: directorDecision.shouldMultipleRespond,
        reason: directorDecision.reason
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 