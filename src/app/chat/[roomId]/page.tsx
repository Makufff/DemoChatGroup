'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import ChatMessage from '@/components/ChatMessage';
import MessageInput from '@/components/MessageInput';
import CharacterSelector from '@/components/CharacterSelector';
import ExportChat from '@/components/ExportChat';

interface ReplyInfo {
  messageId: string;
  content: string;
}

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ReplyInfo | null>(null);
  
  const { 
    rooms, 
    setCurrentRoom, 
    sendMessage,
    isLoading,
    error 
  } = useChatStore();

  const currentRoom = rooms[roomId];

  useEffect(() => {
    if (!currentRoom) {
      router.push('/');
      return;
    }
    setCurrentRoom(roomId);
  }, [roomId, currentRoom, router, setCurrentRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentRoom?.messages]);

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading chat room...</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = async (content: string, imageFile?: File, replyInfo?: ReplyInfo) => {
    await sendMessage(roomId, content, imageFile, replyInfo);
    setReplyTo(null); // Clear reply after sending
  };

  const handleReply = (messageId: string, content: string) => {
    setReplyTo({ messageId, content });
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chat Room
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentRoom.characters.length} character{currentRoom.characters.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ExportChat room={currentRoom} />
            <CharacterSelector roomId={roomId} />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-2">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentRoom.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Welcome to your chat room!
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Start a conversation with {currentRoom.characters.map(c => c.name).join(', ')}.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              The AI Director will automatically choose who responds to your messages.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              💡 Try asking &quot;What do you all think?&quot; to get everyone&apos;s opinion!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              📷 You can also share images for analysis!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              💬 Click the reply button on any message to reply directly!
            </p>
          </div>
        ) : (
          currentRoom.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              character={currentRoom.characters.find(c => c.id === message.characterId)}
              onReply={handleReply}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Characters are thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <MessageInput 
          onSendMessage={handleSendMessage} 
          disabled={isLoading}
          replyTo={replyTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    </div>
  );
} 