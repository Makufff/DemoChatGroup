'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/store/chatStore';
import { Character } from '@/types/chat';
import CharacterTemplates from '@/components/CharacterTemplates';
import CustomCharacterForm from '@/components/CustomCharacterForm';

// Sample characters for demonstration
const sampleCharacters: Character[] = [
  {
    id: '1',
    name: 'Sherlock Holmes',
    description: 'A brilliant detective with keen observational skills and deductive reasoning.',
    avatar: '🕵️'
  },
  {
    id: '2',
    name: 'Einstein',
    description: 'A theoretical physicist known for developing the theory of relativity.',
    avatar: '🧠'
  },
  {
    id: '3',
    name: 'Shakespeare',
    description: 'A renowned playwright and poet known for his mastery of language and human nature.',
    avatar: '✒️'
  }
];

export default function Home() {
  const router = useRouter();
  const { createRoom, rooms } = useChatStore();
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [customCharacters, setCustomCharacters] = useState<Character[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);

  const toggleCharacter = (character: Character) => {
    setSelectedCharacters(prev => 
      prev.find(c => c.id === character.id)
        ? prev.filter(c => c.id !== character.id)
        : [...prev, character]
    );
  };

  const handleTemplateSelect = (characters: Character[]) => {
    setSelectedCharacters(characters);
  };

  const handleAddCustomCharacter = (character: Character) => {
    setCustomCharacters(prev => [...prev, character]);
    setSelectedCharacters(prev => [...prev, character]);
  };

  const handleRemoveCustomCharacter = (characterId: string) => {
    setCustomCharacters(prev => prev.filter(c => c.id !== characterId));
    setSelectedCharacters(prev => prev.filter(c => c.id !== characterId));
  };

  const startChat = () => {
    if (selectedCharacters.length === 0) return;
    
    const roomId = createRoom(selectedCharacters);
    router.push(`/chat/${roomId}`);
  };

  const hasActiveChats = Object.keys(rooms).length > 0;
  const allCharacters = [...sampleCharacters, ...customCharacters];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            ChatGroup AI with Director
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Chat with multiple AI characters in one room. Our Director Agent decides who should reply based on your questions.
          </p>
        </div>

        {/* Chat Preview Section */}
        {hasActiveChats && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Recent Chats
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(rooms).map(([roomId, room]) => (
                <div
                  key={roomId}
                  onClick={() => router.push(`/chat/${roomId}`)}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center mb-3">
                    <div className="flex -space-x-2 mr-3">
                      {room.characters.slice(0, 3).map((char) => (
                        <div
                          key={char.id}
                          className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-800"
                        >
                          {char.avatar || char.name[0]}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {room.messages.length} messages
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {room.characters.map(c => c.name).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Last updated: {new Date(room.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Character Selection */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Select Characters for Your Chat
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCustomForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                ➕ Add Custom
              </button>
              <CharacterTemplates onSelectTemplate={handleTemplateSelect} />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {allCharacters.map((character) => (
              <div
                key={character.id}
                onClick={() => toggleCharacter(character)}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 relative ${
                  selectedCharacters.find(c => c.id === character.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {/* Remove button for custom characters */}
                {customCharacters.find(c => c.id === character.id) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCustomCharacter(character.id);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    title="Remove custom character"
                  >
                    ×
                  </button>
                )}
                
                <div className="text-4xl mb-3">{character.avatar}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {character.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {character.description}
                </p>
                {selectedCharacters.find(c => c.id === character.id) && (
                  <div className="mt-3 text-blue-600 dark:text-blue-400 text-sm font-medium">
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Custom Character Card */}
            <div
              onClick={() => setShowCustomForm(true)}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 flex flex-col items-center justify-center min-h-[200px]"
            >
              <div className="text-4xl mb-3">➕</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                Add Custom Character
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Create your own character with custom personality and expertise
              </p>
            </div>
          </div>

          {/* Start Chat Button */}
          <div className="text-center">
            <button
              onClick={startChat}
              disabled={selectedCharacters.length === 0}
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                selectedCharacters.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {selectedCharacters.length === 0
                ? 'Select at least one character'
                : `Start Chat with ${selectedCharacters.length} Character${selectedCharacters.length > 1 ? 's' : ''}`
              }
            </button>
          </div>
        </div>
      </div>

      {/* Custom Character Form Modal */}
      {showCustomForm && (
        <CustomCharacterForm
          onClose={() => setShowCustomForm(false)}
          onAddCharacter={handleAddCustomCharacter}
        />
      )}
    </div>
  );
}
