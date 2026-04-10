import React from 'react';

interface AIThinkingProps {
  playerType: 'tiger' | 'goat';
}

const AIThinking: React.FC<AIThinkingProps> = ({ playerType }) => {
  const emoji = playerType === 'tiger' ? '🐅' : '🐐';

  const bgColor = playerType === 'tiger' ? 'bg-orange-100' : 'bg-green-100';
  const borderColor = playerType === 'tiger' ? 'border-orange-300' : 'border-green-300';
  const textColor = playerType === 'tiger' ? 'text-orange-800' : 'text-green-800';
  const dotColor = playerType === 'tiger' ? 'bg-orange-500' : 'bg-green-500';

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-4 animate-pulse`}>
      <div className="flex items-center justify-center space-x-3">
        <span className="text-3xl animate-bounce">{emoji}</span>
        <div>
          <p className={`font-bold ${textColor}`}>AI is thinking...</p>
          <div className="flex space-x-1 mt-2">
            <div
              className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`}
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`}
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className={`w-2 h-2 ${dotColor} rounded-full animate-bounce`}
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIThinking;
