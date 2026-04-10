import React from 'react';
import { AIFactory } from '@/ai';

interface DifficultySelectorProps {
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
  disabled?: boolean;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedLevel,
  onSelectLevel,
  disabled = false,
}) => {
  const levels = [1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <h3 className="font-bold text-lg text-gray-800 mb-4">AI Difficulty</h3>

      <div className="space-y-3">
        {levels.map((level) => {
          const isSelected = level === selectedLevel;
          const name = AIFactory.getDifficultyName(level);
          const description = AIFactory.getDifficultyDescription(level);

          return (
            <button
              key={level}
              onClick={() => onSelectLevel(level)}
              disabled={disabled}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{name}</span>
                {isSelected && (
                  <span className="text-orange-500 text-xl">✓</span>
                )}
              </div>
              <p className="text-xs text-gray-600">{description}</p>
            </button>
          );
        })}

      </div>

      {/* Quick Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-gray-700">
        <p className="font-semibold mb-1">💡 Tip:</p>
        <p>Start with Easy if you're new, then progress to higher difficulties!</p>
      </div>
    </div>
  );
};

export default DifficultySelector;
