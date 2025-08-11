'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import { Character } from '@/types/chat';

interface CharacterSelectorProps {
  roomId: string;
}

// Sample characters for adding to existing rooms
const availableCharacters: Character[] = [
  {
    id: '4',
    name: 'Marie Curie',
    description: 'A pioneering physicist and chemist known for her research on radioactivity.',
    avatar: '🔬'
  },
  {
    id: '5',
    name: 'Leonardo da Vinci',
    description: 'A polymath known for his contributions to art, science, and engineering.',
    avatar: '🎨'
  },
  {
    id: '6',
    name: 'Cleopatra',
    description: 'The last active ruler of the Ptolemaic Kingdom of Egypt.',
    avatar: '👑'
  }
];

// Available emoji avatars for custom characters
const emojiAvatars = ['🤖', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻', '🧙‍♂️', '🧙‍♀️', '👑', '⚡', '🌟', '🎭', '🎪', '🔮', '💎'];

export default function CharacterSelector({ roomId }: CharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🤖');
  
  const { rooms, addCharacter } = useChatStore();
  
  const currentRoom = rooms[roomId];
  const currentCharacterIds = currentRoom?.characters.map(c => c.id) || [];
  
  const availableToAdd = availableCharacters.filter(
    char => !currentCharacterIds.includes(char.id)
  );

  const handleAddCharacter = (character: Character) => {
    addCharacter(roomId, character);
    setIsOpen(false);
  };

  const handleAddCustomCharacter = () => {
    if (customName.trim() && customDescription.trim()) {
      const customCharacter: Character = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: customName.trim(),
        description: customDescription.trim(),
        avatar: selectedAvatar
      };
      
      addCharacter(roomId, customCharacter);
      setCustomName('');
      setCustomDescription('');
      setSelectedAvatar('🤖');
      setShowCustomForm(false);
      setIsOpen(false);
    }
  };

  const handleCancelCustom = () => {
    setCustomName('');
    setCustomDescription('');
    setSelectedAvatar('🤖');
    setShowCustomForm(false);
  };

  if (!currentRoom) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <span className="flex items-center space-x-2">
          <span className="text-lg">➕</span>
          <span className="font-medium">Add Character</span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {showCustomForm ? 'Create Custom Character' : 'Add Character'}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6">
            {!showCustomForm ? (
              <>
                {/* Custom Character Button */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="w-full p-4 border-2 border-dashed border-green-300 dark:border-green-600 rounded-xl hover:border-green-500 dark:hover:border-green-400 transition-all duration-200 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 group"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-200">✨</div>
                      <div className="font-semibold text-lg">Create Custom Character</div>
                      <div className="text-sm opacity-75">Design your own AI personality</div>
                    </div>
                  </button>
                </div>

                {/* Available Characters */}
                {availableToAdd.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🎭</div>
                    <p className="text-gray-500 dark:text-gray-400">
                      All available characters are already in this room.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                      <span className="mr-2">🎯</span>
                      Preset Characters
                    </div>
                    {availableToAdd.map((character) => (
                      <div
                        key={character.id}
                        onClick={() => handleAddCharacter(character)}
                        className="flex items-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 border border-gray-100 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md"
                      >
                        <div className="text-3xl mr-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                          {character.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 dark:text-white text-lg">
                            {character.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {character.description}
                          </div>
                        </div>
                        <div className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Custom Character Form */
              <div className="space-y-6">
                {/* Back Button */}
                <button
                  onClick={handleCancelCustom}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to character selection
                </button>
                
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    🎭 Choose Avatar
                  </label>
                  <div className="grid grid-cols-10 gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    {emojiAvatars.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => setSelectedAvatar(emoji)}
                        className={`w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all duration-200 ${
                          selectedAvatar === emoji
                            ? 'bg-green-500 text-white shadow-lg scale-110'
                            : 'bg-white dark:bg-gray-600 hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📝 Character Name
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter character name..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📖 Character Description
                  </label>
                  <textarea
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Describe the character's personality, expertise, and background..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleAddCustomCharacter}
                    disabled={!customName.trim() || !customDescription.trim()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                  >
                    ✨ Add Character
                  </button>
                  <button
                    onClick={handleCancelCustom}
                    className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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