import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowRules: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, onShowRules }) => {
  if (!isOpen) return null;

  const handleShowRules = () => {
    onClose();
    onShowRules();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-overlay-enter">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden modal-content-enter">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-8 text-center">
          <div className="text-6xl mb-4">🐅 🐐</div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Bagh Chal!</h1>
          <p className="text-orange-100">Traditional Nepali Strategy Game</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="space-y-4 text-gray-700">
            <p className="text-lg">
              <strong>Bagh Chal</strong> (meaning "Tiger Move") is a centuries-old strategy game from Nepal.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">The Battle:</h3>
              <div className="space-y-2 text-sm">
                <p>🐅 <strong>4 Tigers</strong> - Hunt and capture goats</p>
                <p>🐐 <strong>20 Goats</strong> - Work together to trap tigers</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong>🎯 Tigers win</strong> by capturing 5 goats
              </p>
              <p>
                <strong>🎯 Goats win</strong> by blocking all tigers
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">Features:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>✓ 5 AI Difficulty Levels</div>
                <div>✓ Move Hints</div>
                <div>✓ Adaptive AI (Level 5)</div>
                <div>✓ Game Statistics</div>
                <div>✓ Move Analysis</div>
                <div>✓ Strategy Tips</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleShowRules}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105"
            >
              📖 Learn How to Play
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
            >
              Start Playing
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            You can view the rules anytime by clicking "How to Play" in the game controls.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
