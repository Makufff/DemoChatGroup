'use client';

import { useState } from 'react';
import { Character } from '@/types/chat';

interface CharacterTemplatesProps {
  onSelectTemplate: (characters: Character[]) => void;
}

const characterTemplates = {
  'detective': {
    name: 'Detective Team',
    description: 'Mystery solving experts',
    characters: [
      {
        id: 'sherlock',
        name: 'Sherlock Holmes',
        description: 'A brilliant detective with keen observational skills and deductive reasoning.',
        avatar: '🕵️'
      },
      {
        id: 'watson',
        name: 'Dr. Watson',
        description: 'A medical doctor and loyal companion with practical wisdom.',
        avatar: '👨‍⚕️'
      }
    ]
  },
  'scientists': {
    name: 'Scientific Minds',
    description: 'Innovators and researchers',
    characters: [
      {
        id: 'einstein',
        name: 'Einstein',
        description: 'A theoretical physicist known for developing the theory of relativity.',
        avatar: '🧠'
      },
      {
        id: 'curie',
        name: 'Marie Curie',
        description: 'A pioneering physicist and chemist known for her research on radioactivity.',
        avatar: '🔬'
      },
      {
        id: 'tesla',
        name: 'Nikola Tesla',
        description: 'An inventor and electrical engineer known for his contributions to AC power.',
        avatar: '⚡'
      }
    ]
  },
  'artists': {
    name: 'Creative Minds',
    description: 'Artists and visionaries',
    characters: [
      {
        id: 'shakespeare',
        name: 'Shakespeare',
        description: 'A renowned playwright and poet known for his mastery of language and human nature.',
        avatar: '✒️'
      },
      {
        id: 'davinci',
        name: 'Leonardo da Vinci',
        description: 'A polymath known for his contributions to art, science, and engineering.',
        avatar: '🎨'
      },
      {
        id: 'mozart',
        name: 'Mozart',
        description: 'A prolific composer of the Classical period with extraordinary musical talent.',
        avatar: '🎼'
      }
    ]
  },
  'leaders': {
    name: 'Historical Leaders',
    description: 'Influential figures from history',
    characters: [
      {
        id: 'cleopatra',
        name: 'Cleopatra',
        description: 'The last active ruler of the Ptolemaic Kingdom of Egypt.',
        avatar: '👑'
      },
      {
        id: 'caesar',
        name: 'Julius Caesar',
        description: 'A Roman general and statesman who played a critical role in the rise of the Roman Empire.',
        avatar: '⚔️'
      },
      {
        id: 'joan',
        name: 'Joan of Arc',
        description: 'A French heroine and Catholic saint who led French forces during the Hundred Years\' War.',
        avatar: '🛡️'
      }
    ]
  },
  'philosophers': {
    name: 'Great Thinkers',
    description: 'Philosophers and intellectuals',
    characters: [
      {
        id: 'socrates',
        name: 'Socrates',
        description: 'A classical Greek philosopher credited as the founder of Western philosophy.',
        avatar: '🤔'
      },
      {
        id: 'confucius',
        name: 'Confucius',
        description: 'A Chinese philosopher and politician whose teachings emphasized personal and governmental morality.',
        avatar: '📚'
      },
      {
        id: 'aristotle',
        name: 'Aristotle',
        description: 'A Greek philosopher and polymath who made fundamental contributions to logic, metaphysics, and ethics.',
        avatar: '🏛️'
      }
    ]
  }
};

export default function CharacterTemplates({ onSelectTemplate }: CharacterTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleTemplateSelect = (templateKey: keyof typeof characterTemplates) => {
    const template = characterTemplates[templateKey];
    onSelectTemplate(template.characters);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
      >
        📋 Character Templates
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Choose Character Template
            </h3>
            
            <div className="space-y-3">
              {Object.entries(characterTemplates).map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => handleTemplateSelect(key as keyof typeof characterTemplates)}
                  className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {template.characters.length} characters
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {template.description}
                  </p>
                  <div className="flex space-x-1">
                    {template.characters.map((char) => (
                      <span key={char.id} className="text-lg" title={char.name}>
                        {char.avatar}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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