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

export default function CharacterSelector({ roomId }: CharacterSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  if (!currentRoom) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        + Add Character
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Add Character
            </h3>
            
            {availableToAdd.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                All available characters are already in this room.
              </p>
            ) : (
              <div className="space-y-2">
                {availableToAdd.map((character) => (
                  <div
                    key={character.id}
                    onClick={() => handleAddCharacter(character)}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <div className="text-2xl mr-3">{character.avatar}</div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {character.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {character.description}
                      </div>
                    </div>
                  </div>
                ))}
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