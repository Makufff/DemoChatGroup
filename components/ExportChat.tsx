'use client';

import { useState } from 'react';
import { ChatRoom, Message } from '@/types/chat';

interface ExportChatProps {
  room: ChatRoom;
}

export default function ExportChat({ room }: ExportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<'txt' | 'json' | 'md'>('txt');

  const exportToText = () => {
    const content = generateTextContent();
    downloadFile(content, `chat-${room.id}.txt`, 'text/plain');
  };

  const exportToJSON = () => {
    const content = JSON.stringify(room, null, 2);
    downloadFile(content, `chat-${room.id}.json`, 'application/json');
  };

  const exportToMarkdown = () => {
    const content = generateMarkdownContent();
    downloadFile(content, `chat-${room.id}.md`, 'text/markdown');
  };

  const generateTextContent = () => {
    let content = `ChatGroup AI with Director - Chat Export\n`;
    content += `Room ID: ${room.id}\n`;
    content += `Created: ${new Date(room.createdAt).toLocaleString()}\n`;
    content += `Characters: ${room.characters.map(c => c.name).join(', ')}\n`;
    content += `\n${'='.repeat(50)}\n\n`;

    room.messages.forEach((message) => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const sender = getMessageSender(message);
      content += `[${timestamp}] ${sender}: ${message.content}\n`;
      
      // Add reply context if this is a reply
      if (message.replyTo && message.replyToContent) {
        const repliedSender = getRepliedMessageSender(message.replyTo);
        content += `[Replying to: ${repliedSender}] ${message.replyToContent}\n`;
      }
      
      if (message.imageUrl) {
        content += `[Image attached: ${message.imageUrl}]\n`;
      }
      content += '\n';
    });

    return content;
  };

  const generateMarkdownContent = () => {
    let content = `# ChatGroup AI with Director - Chat Export\n\n`;
    content += `**Room ID:** ${room.id}\n`;
    content += `**Created:** ${new Date(room.createdAt).toLocaleString()}\n`;
    content += `**Characters:** ${room.characters.map(c => c.name).join(', ')}\n\n`;
    content += `---\n\n`;

    room.messages.forEach((message) => {
      const timestamp = new Date(message.timestamp).toLocaleString();
      const sender = getMessageSender(message);
      
      content += `### ${timestamp} - ${sender}\n\n`;
      
      // Add reply context if this is a reply
      if (message.replyTo && message.replyToContent) {
        const repliedSender = getRepliedMessageSender(message.replyTo);
        content += `> **Replying to:** ${repliedSender}\n`;
        content += `> ${message.replyToContent}\n\n`;
      }
      
      // Add message content
      content += `${message.content}\n\n`;
      
      // Add image if present
      if (message.imageUrl) {
        content += `![Image](${message.imageUrl})\n\n`;
      }
      
      content += `---\n\n`;
    });

    return content;
  };

  const getMessageSender = (message: Message): string => {
    if (message.role === 'user') return 'You';
    if (message.role === 'director') return '🎬 Director';
    if (message.role === 'assistant' && message.characterId) {
      const character = room.characters.find(c => c.id === message.characterId);
      return character ? character.name : 'Assistant';
    }
    return 'Assistant';
  };

  const getRepliedMessageSender = (replyToId: string): string => {
    const repliedMessage = room.messages.find(msg => msg.id === replyToId);
    if (repliedMessage) {
      return getMessageSender(repliedMessage);
    }
    return 'Unknown';
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const handleExport = () => {
    switch (format) {
      case 'txt':
        exportToText();
        break;
      case 'json':
        exportToJSON();
        break;
      case 'md':
        exportToMarkdown();
        break;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
      >
        📤 Export Chat
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Export Chat
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value as 'txt' | 'json' | 'md')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="txt">Plain Text (.txt)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="md">Markdown (.md)</option>
                </select>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format === 'txt' && 'Simple text format with timestamps and reply info'}
                {format === 'json' && 'Complete data structure for backup'}
                {format === 'md' && 'Formatted markdown with images and reply context'}
              </div>

              <button
                onClick={handleExport}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 