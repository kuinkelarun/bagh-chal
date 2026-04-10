import React, { useState, useEffect } from 'react';
import { GameStatisticsTracker, PlayerStatistics } from '@/utils/gameStatistics';

const GameStatistics: React.FC = () => {
  const [stats, setStats] = useState<PlayerStatistics | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const playerStats = GameStatisticsTracker.getPlayerStatistics();
    setStats(playerStats);
  }, []);

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <h3 className="font-bold text-lg text-gray-800 mb-3">Your Statistics</h3>
        <p className="text-gray-600 text-sm">Play some games to see your statistics!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800">Your Statistics</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-800">{stats.totalGames}</div>
          <div className="text-xs text-gray-600">Total Games</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-800">
            {(stats.winRate * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600">Win Rate</div>
        </div>
      </div>

      {/* Win/Loss Record */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Wins: <strong className="text-green-600">{stats.wins}</strong></span>
        <span className="text-gray-600">Losses: <strong className="text-red-600">{stats.losses}</strong></span>
        {stats.draws > 0 && (
          <span className="text-gray-600">Draws: <strong>{stats.draws}</strong></span>
        )}
      </div>

      {/* Detailed Stats */}
      {showDetails && (
        <div className="space-y-3 pt-3 border-t animate-slide-up">
          {/* Average Stats */}
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Moves per Game:</span>
              <strong>{stats.averageMovesPerGame.toFixed(1)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. Game Duration:</span>
              <strong>{Math.floor(stats.averageGameDuration / 60)}m {Math.floor(stats.averageGameDuration % 60)}s</strong>
            </div>
          </div>

          {/* VS AI Stats */}
          {Object.keys(stats.vsAIStats).length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">vs AI Performance:</div>
              <div className="space-y-2">
                {Object.entries(stats.vsAIStats).map(([difficulty, aiStats]) => (
                  <div
                    key={difficulty}
                    className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded"
                  >
                    <span className="text-gray-600">
                      Level {difficulty}:
                    </span>
                    <span>
                      {aiStats.wins}/{aiStats.games}
                      <span className="ml-2 text-gray-500">
                        ({(aiStats.winRate * 100).toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clear Stats Button */}
          <button
            onClick={() => {
              if (confirm('Clear all statistics? This cannot be undone.')) {
                GameStatisticsTracker.clearStatistics();
                setStats(GameStatisticsTracker.getPlayerStatistics());
              }
            }}
            className="w-full text-xs text-red-600 hover:text-red-800 py-2 border border-red-300 rounded hover:bg-red-50 transition-colors"
          >
            Clear Statistics
          </button>
        </div>
      )}
    </div>
  );
};

export default GameStatistics;
