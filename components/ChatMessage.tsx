import { Message, Character } from '@/types/chat';
import Image from 'next/image';

interface ChatMessageProps {
  message: Message;
  character?: Character;
}

export default function ChatMessage({ message, character }: ChatMessageProps) {
  const isUser = message.role === 'user';

  // Don't render director messages since Director works behind the scenes
  if (message.role === 'director') {
    return null;
  }

  const getMessageStyle = () => {
    if (isUser) {
      return 'bg-blue-600 text-white ml-auto';
    }
    return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
  };

  const getAvatar = () => {
    if (isUser) return '👤';
    return character?.avatar || '🤖';
  };

  const getName = () => {
    if (isUser) return 'You';
    return character?.name || 'Assistant';
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isUser 
            ? 'bg-blue-500 text-white ml-2' 
            : 'bg-gray-500 text-white mr-2'
        }`}>
          {getAvatar()}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-lg ${getMessageStyle()}`}>
            {/* Image Display */}
            {message.imageUrl && (
              <div className="mb-2">
                <Image
                  src={message.imageUrl}
                  alt="Message attachment"
                  width={256}
                  height={256}
                  className="max-w-full h-auto rounded-lg max-h-64 object-cover"
                />
              </div>
            )}
            
            {/* Text Content */}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
          
          {/* Message Info */}
          <div className={`flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <span className="font-medium">{getName()}</span>
            <span className="mx-1">•</span>
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            {message.imageUrl && (
              <>
                <span className="mx-1">•</span>
                <span>📷</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 