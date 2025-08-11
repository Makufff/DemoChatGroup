export interface Character {
  id: string;
  name: string;
  description: string;
  avatar?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "director";
  content: string;
  timestamp: string;
  characterId?: string; // For assistant messages
  imageUrl?: string; // For multimodal content
  replyTo?: string; // ID of the message being replied to
  replyToContent?: string; // Content of the message being replied to (for display)
}

export interface ChatHistory {
  [roomId: string]: {
    id: string;
    characters: Character[];
    messages: Message[];
    createdAt: string;
    updatedAt: string;
  };
}

export interface ChatRoom {
  id: string;
  characters: Character[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  rooms: ChatHistory;
  currentRoomId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface DirectorDecision {
  characterId: string;
  reason: string;
  confidence: number;
} 