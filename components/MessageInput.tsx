'use client';

import { useState, KeyboardEvent } from 'react';
import ImageUpload from '@/components/ImageUpload';

interface ReplyInfo {
  messageId: string;
  content: string;
}

interface MessageInputProps {
  onSendMessage: (content: string, imageFile?: File, replyTo?: ReplyInfo) => void;
  disabled?: boolean;
  replyTo?: ReplyInfo | null;
  onCancelReply?: () => void;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  replyTo = null,
  onCancelReply 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSend = () => {
    if ((message.trim() || selectedImage) && !disabled) {
      onSendMessage(message.trim(), selectedImage || undefined, replyTo || undefined);
      setMessage('');
      setSelectedImage(null);
      setShowImageUpload(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="space-y-3">
      {/* Reply Preview */}
      {replyTo && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                Replying to:
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 truncate">
                {replyTo.content.length > 100 
                  ? `${replyTo.content.substring(0, 100)}...` 
                  : replyTo.content
                }
              </div>
            </div>
            <button
              onClick={onCancelReply}
              className="ml-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              title="Cancel reply"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Image Upload Toggle */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setShowImageUpload(!showImageUpload)}
          disabled={disabled}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📷
        </button>
        {selectedImage && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>📎 {selectedImage.name}</span>
            <button
              onClick={clearImage}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Image Upload Area */}
      {showImageUpload && (
        <ImageUpload
          onImageSelect={handleImageSelect}
          disabled={disabled}
        />
      )}

      {/* Message Input */}
      <div className="flex items-end space-x-2">
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              replyTo 
                ? "Type your reply..." 
                : selectedImage 
                  ? "Add a message to your image..." 
                  : "Type your message..."
            }
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>
        
        <button
          onClick={handleSend}
          disabled={(!message.trim() && !selectedImage) || disabled}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {replyTo ? 'Reply' : 'Send'}
        </button>
      </div>
    </div>
  );
} 