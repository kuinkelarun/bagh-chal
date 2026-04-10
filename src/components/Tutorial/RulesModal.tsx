import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-overlay-enter">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content-enter">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">🎮 How to Play Bagh Chal</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-sm mt-1 text-orange-100">Tiger vs Goat - Traditional Nepali Strategy Game</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overview */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">📋 Game Overview</h3>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
              <p>🐅 <strong>4 Tigers</strong> vs 🐐 <strong>20 Goats</strong></p>
              <p>🎯 <strong>Tigers win</strong> by capturing 5 goats</p>
              <p>🎯 <strong>Goats win</strong> by blocking all tigers (no legal moves)</p>
            </div>
          </section>

          {/* Setup */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">⚙️ Setup</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">🐅</span>
                <span><strong>Tigers</strong> start at the four corners of the 5×5 board</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">🐐</span>
                <span><strong>Goats</strong> start off the board and are placed during gameplay</span>
              </li>
            </ul>
          </section>

          {/* Gameplay Phases */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">🎲 Two Phases</h3>

            {/* Phase 1 */}
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <h4 className="font-bold text-green-800 mb-2">Phase 1: Placement (First 20 turns)</h4>
              <ul className="space-y-1 text-sm text-gray-700 ml-4">
                <li>• <strong>Goats</strong> place one piece at a time on any empty point</li>
                <li>• <strong>Tigers</strong> can move to adjacent empty points <span className="text-orange-600 font-semibold">(yes, during placement!)</span></li>
                <li>• <strong>Tigers</strong> can capture goats by jumping over them</li>
                <li>• Continues until all 20 goats are placed</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-bold text-orange-800 mb-2">Phase 2: Movement (After all goats placed)</h4>
              <ul className="space-y-1 text-sm text-gray-700 ml-4">
                <li>• <strong>Both players</strong> move their pieces to adjacent empty points</li>
                <li>• <strong>Tigers</strong> continue to capture by jumping over goats</li>
                <li>• <strong>Goats</strong> work together to trap the tigers</li>
              </ul>
            </div>
          </section>

          {/* How to Move */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">🎯 How to Move</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-1">During Placement Phase:</p>
                <p>Click on any <span className="text-green-600 font-bold">empty point</span> to place a goat</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold mb-1">During Movement Phase:</p>
                <ol className="ml-4 space-y-1">
                  <li>1. Click on <span className="font-bold">your piece</span> to select it</li>
                  <li>2. Valid moves will be <span className="text-green-500 font-bold">highlighted in green</span></li>
                  <li>3. Click on a <span className="text-green-500 font-bold">highlighted point</span> to move</li>
                </ol>
              </div>
              <div className="bg-amber-50 p-3 rounded border-l-4 border-amber-500">
                <p className="font-semibold mb-1 text-amber-800">⚠️ Important: Diagonal Movement</p>
                <p className="text-xs">Pieces can move diagonally <strong>only from certain positions</strong>:</p>
                <ul className="ml-4 mt-1 text-xs space-y-0.5">
                  <li>• The 4 <strong>corners</strong></li>
                  <li>• The <strong>center</strong> point</li>
                  <li>• The 4 <strong>edge midpoints</strong> (top, bottom, left, right)</li>
                </ul>
                <p className="text-xs mt-1">All other positions can only move horizontally or vertically!</p>

                {/* Visual diagram */}
                <div className="mt-3 bg-white p-3 rounded">
                  <p className="text-xs font-semibold text-center mb-2">Diagonal Movement Map:</p>
                  <div className="flex justify-center">
                    <div className="space-y-1">
                      {[
                        ['✓', '○', '✓', '○', '✓'],
                        ['○', '○', '○', '○', '○'],
                        ['✓', '○', '✓', '○', '✓'],
                        ['○', '○', '○', '○', '○'],
                        ['✓', '○', '✓', '○', '✓'],
                      ].map((row, i) => (
                        <div key={i} className="flex gap-1">
                          {row.map((cell, j) => (
                            <div
                              key={j}
                              className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                                cell === '✓'
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              {cell}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-center mt-2 text-gray-600">
                    ✓ = Can move diagonally (9 positions) | ○ = No diagonals (16 positions)
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Capturing */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">⚔️ How Tigers Capture</h3>
            <div className="bg-red-50 p-4 rounded-lg space-y-2 text-sm text-gray-700">
              <p>A tiger can capture a goat by <strong>jumping over it</strong>:</p>
              <ol className="ml-4 space-y-1">
                <li>1. Tiger must be <strong>adjacent</strong> to a goat</li>
                <li>2. The point <strong>directly beyond</strong> the goat must be empty</li>
                <li>3. Tiger jumps to the empty point, <strong>capturing</strong> the goat</li>
              </ol>
              <div className="mt-2 p-2 bg-white rounded border border-red-200">
                <p className="font-mono text-xs">Example: 🐅 - 🐐 - ⭕ → 🐅 jumps over goat to empty spot</p>
              </div>
            </div>
          </section>

          {/* Strategy Tips */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">💡 Strategy Tips</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Tiger Tips */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-bold text-orange-800 mb-2">🐅 For Tigers:</h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>✓ Control the center for more mobility</li>
                  <li>✓ Create capture opportunities</li>
                  <li>✓ Force goats into vulnerable positions</li>
                  <li>✓ Avoid getting trapped in corners</li>
                  <li>✓ Plan capture sequences ahead</li>
                </ul>
              </div>

              {/* Goat Tips */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">🐐 For Goats:</h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li>✓ Build defensive walls early</li>
                  <li>✓ Work together to trap tigers</li>
                  <li>✓ Avoid leaving isolated goats</li>
                  <li>✓ Control key positions</li>
                  <li>✓ Strategic sacrifices can lead to victory</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Win Conditions */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">🏆 How to Win</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-300">
                <div className="text-4xl text-center mb-2">🐅</div>
                <p className="text-center font-bold text-orange-800">Tigers Win</p>
                <p className="text-sm text-center text-gray-700 mt-2">
                  Capture <strong>5 or more goats</strong>
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
                <div className="text-4xl text-center mb-2">🐐</div>
                <p className="text-center font-bold text-green-800">Goats Win</p>
                <p className="text-sm text-center text-gray-700 mt-2">
                  <strong>Block all 4 tigers</strong> so none can move
                </p>
              </div>
            </div>
          </section>

          {/* Game Features */}
          <section className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-2">🎮 Game Features</h3>
            <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
              <li>• 💡 <strong>Hints</strong> - Get strategic suggestions</li>
              <li>• 🤖 <strong>5 AI Levels</strong> - From Easy to Adaptive</li>
              <li>• ↩️ <strong>Undo</strong> - Take back moves</li>
              <li>• 📊 <strong>Statistics</strong> - Track your progress</li>
              <li>• 📈 <strong>Move Analysis</strong> - Learn from your games</li>
              <li>• 🎯 <strong>Strategic Advice</strong> - Real-time tips</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-4 rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            Got It! Let's Play 🎮
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
