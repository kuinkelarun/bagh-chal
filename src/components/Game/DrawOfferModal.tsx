import React from 'react';

interface DrawOfferModalProps {
  isOpen: boolean;
  onAcceptDraw: () => void;
  onContinue: () => void;
  reason: 'repetition' | 'no-progress';
}

const DrawOfferModal: React.FC<DrawOfferModalProps> = ({
  isOpen,
  onAcceptDraw,
  onContinue,
  reason,
}) => {
  if (!isOpen) return null;

  const title =
    reason === 'repetition'
      ? 'Repetitive Position Detected'
      : 'Game Appears Stuck';

  const body =
    reason === 'repetition'
      ? 'The same board position has occurred multiple times. The game may be stuck in a loop.'
      : 'No captures or placements have occurred for a long time. The game may not be making progress.';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Draw offer"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="text-5xl mb-3">🤝</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-6">{body}</p>

        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
          >
            Continue Playing
          </button>
          <button
            onClick={onAcceptDraw}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105"
          >
            End as Draw
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawOfferModal;
