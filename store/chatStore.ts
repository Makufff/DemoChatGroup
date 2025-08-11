import { create } from 'zustand';
import { ChatState, ChatRoom, Character, Message } from '@/types/chat';

interface ChatStore extends ChatState {
  // Actions
  createRoom: (characters: Character[]) => string;
  setCurrentRoom: (roomId: string) => void;
  addMessage: (roomId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  addCharacter: (roomId: string, character: Character) => void;
  removeCharacter: (roomId: string, characterId: string) => void;
  clearRoom: (roomId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // AI Response actions
  sendMessage: (roomId: string, content: string, imageFile?: File, replyTo?: { messageId: string; content: string }) => Promise<void>;
}

interface CharacterResponse {
  content: string;
  characterId: string;
  characterName: string;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  rooms: {},
  currentRoomId: null,
  isLoading: false,
  error: null,

  // Actions
  createRoom: (characters) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRoom: ChatRoom = {
      id: roomId,
      characters,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      rooms: {
        ...state.rooms,
        [roomId]: newRoom,
      },
      currentRoomId: roomId,
    }));

    return roomId;
  },

  setCurrentRoom: (roomId) => {
    set({ currentRoomId: roomId });
  },

  addMessage: (roomId, message) => {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      rooms: {
        ...state.rooms,
        [roomId]: {
          ...state.rooms[roomId],
          messages: [...state.rooms[roomId].messages, newMessage],
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },

  addCharacter: (roomId, character) => {
    set((state) => ({
      rooms: {
        ...state.rooms,
        [roomId]: {
          ...state.rooms[roomId],
          characters: [...state.rooms[roomId].characters, character],
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },

  removeCharacter: (roomId, characterId) => {
    set((state) => ({
      rooms: {
        ...state.rooms,
        [roomId]: {
          ...state.rooms[roomId],
          characters: state.rooms[roomId].characters.filter(
            (char) => char.id !== characterId
          ),
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  },

  clearRoom: (roomId) => {
    set((state) => {
      const { [roomId]: removed, ...remainingRooms } = state.rooms;
      return {
        rooms: remainingRooms,
        currentRoomId: state.currentRoomId === roomId ? null : state.currentRoomId,
      };
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  // AI Response actions
  sendMessage: async (roomId, content, imageFile, replyTo) => {
    const state = get();
    const room = state.rooms[roomId];
    
    if (!room) {
      set({ error: 'Room not found' });
      return;
    }

    // Convert image to base64 if provided
    let imageData: string | undefined;
    if (imageFile) {
      imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          // Remove data URL prefix to get just the base64 data
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(imageFile);
      });
    }

    // Add user message with reply info
    get().addMessage(roomId, {
      role: 'user',
      content: content || (imageFile ? '📷 [Image]' : ''),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      replyTo: replyTo?.messageId,
      replyToContent: replyTo?.content,
    });

    // Set loading state
    set({ isLoading: true, error: null });

    try {
      // Call AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          userMessage: content || (imageFile ? 'Please analyze this image' : ''),
          characters: room.characters,
          messages: room.messages,
          imageData,
          replyTo: replyTo?.messageId, // Include reply info in API call
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add all character responses (no director message)
      data.responses.forEach((characterResponse: CharacterResponse) => {
        get().addMessage(roomId, {
          role: 'assistant',
          content: characterResponse.content,
          characterId: characterResponse.characterId,
        });
      });

    } catch (error) {
      console.error('Send message error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message',
        isLoading: false 
      });
      
      // Add error message to chat
      get().addMessage(roomId, {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error processing your message. Please try again.',
        characterId: room.characters[0]?.id,
      });
    } finally {
      set({ isLoading: false });
    }
  },
})); 