import React, { useState } from 'react';
import { Board } from '@/core/Board';
import { testDiagonalConnections } from '@/utils/boardDiagnostics';

const DiagonalTest: React.FC = () => {
  const [showTest, setShowTest] = useState(false);
  const [testResults, setTestResults] = useState<string>('');

  const runTest = () => {
    // Capture console output
    const originalLog = console.log;
    const logs: string[] = [];

    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    testDiagonalConnections();

    console.log = originalLog;
    setTestResults(logs.join('\n'));
    setShowTest(true);
  };

  const visualizeBoard = () => {
    const board = new Board();
    const positions: { pos: { row: number; col: number }; hasDiagonal: boolean }[] = [];

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const neighbors = board.getNeighbors({ row, col });
        const hasDiagonal = neighbors.some(
          (n) => Math.abs(n.row - row) === 1 && Math.abs(n.col - col) === 1
        );
        positions.push({ pos: { row, col }, hasDiagonal });
      }
    }

    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <h4 className="font-bold text-gray-800 mb-4">Board Diagonal Map</h4>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4].map((col) => {
                const pos = positions.find((p) => p.pos.row === row && p.pos.col === col);
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                      pos?.hasDiagonal
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                    title={`(${row},${col}) - ${pos?.hasDiagonal ? 'Has' : 'No'} diagonals`}
                  >
                    {pos?.hasDiagonal ? '✓' : '○'}
                    <br />
                    <span className="text-[10px]">
                      {row},{col}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-gray-600">
          <p>
            <span className="inline-block w-3 h-3 bg-green-500 mr-1"></span>
            Green = Has diagonal connections (9 positions)
          </p>
          <p>
            <span className="inline-block w-3 h-3 bg-gray-300 mr-1"></span>
            Gray = No diagonal connections (16 positions)
          </p>
        </div>
      </div>
    );
  };

  if (!showTest) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-3">Debug: Diagonal Movement</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test diagonal connections on the board. In Bagh Chal, only certain positions allow
          diagonal movement.
        </p>
        <button
          onClick={runTest}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all"
        >
          🔍 Test Diagonal Connections
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-gray-800">Diagonal Connection Test</h3>
        <button
          onClick={() => setShowTest(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          ×
        </button>
      </div>

      {visualizeBoard()}

      <div className="mt-4 bg-gray-100 p-3 rounded max-h-48 overflow-y-auto">
        <h4 className="font-bold text-sm text-gray-700 mb-2">Test Results:</h4>
        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
          {testResults}
        </pre>
      </div>

      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p className="font-semibold">Expected Pattern:</p>
        <div className="bg-blue-50 p-3 rounded">
          <p className="font-mono text-xs">
            X O X O X<br />
            O O O O O<br />
            X O X O X<br />
            O O O O O<br />
            X O X O X
          </p>
        </div>
        <p className="text-xs">
          X = Has diagonals (corners, center, edge midpoints)
          <br />O = No diagonals (all other positions)
        </p>
      </div>
    </div>
  );
};

export default DiagonalTest;
