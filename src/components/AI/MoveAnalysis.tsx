import React, { useState } from 'react';
import { GameState, PlayerType } from '@/core/types';
import { MoveAnalyzer } from '@/utils/moveAnalysis';

interface MoveAnalysisProps {
  gameState: GameState;
  currentPlayer: PlayerType;
  isAITurn: boolean;
}

const MoveAnalysis: React.FC<MoveAnalysisProps> = ({
  gameState,
  currentPlayer,
  isAITurn,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  const handleGetHint = () => {
    if (isAITurn) return;

    setIsLoadingHint(true);
    // Small delay to show loading state
    setTimeout(() => {
      setShowHint(true);
      setIsLoadingHint(false);
    }, 300);
  };

  const hint = showHint ? MoveAnalyzer.getHint(gameState, currentPlayer) : '';
  const advice = MoveAnalyzer.getStrategicAdvice(gameState, currentPlayer);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-4">
      <h3 className="font-bold text-lg text-gray-800">Move Analysis</h3>

      {/* Strategic Advice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
        <p className="text-sm text-gray-700">{advice}</p>
      </div>

      {/* Hint Button */}
      <button
        onClick={handleGetHint}
        disabled={isAITurn || showHint || isLoadingHint}
        className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
          isAITurn || showHint
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transform hover:scale-105'
        }`}
      >
        {isLoadingHint ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Analyzing...
          </span>
        ) : showHint ? (
          '✓ Hint Shown'
        ) : (
          '💡 Get Hint'
        )}
      </button>

      {/* Display Hint */}
      {showHint && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg animate-slide-up">
          <p className="text-sm text-gray-800 font-medium mb-2">💡 Suggestion:</p>
          <p className="text-sm text-gray-700">{hint}</p>
          <button
            onClick={() => setShowHint(false)}
            className="mt-3 text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Hide hint
          </button>
        </div>
      )}

      {/* Hint Limit Info */}
      <div className="text-xs text-gray-500 text-center">
        Use hints wisely to improve your strategy!
      </div>
    </div>
  );
};

export default MoveAnalysis;
