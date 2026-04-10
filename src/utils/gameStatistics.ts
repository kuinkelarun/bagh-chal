/**
 * Game Statistics Tracking
 * Collects data for ML training and player analytics
 */

import { GameState, Move, PlayerType, GameStatus } from '@/core/types';
import { MoveAnalysis, MoveQuality } from './moveAnalysis';

export interface GameRecord {
  id: string;
  timestamp: number;
  mode: 'human-vs-human' | 'human-vs-ai' | 'ai-vs-human';
  aiDifficulty?: number;
  humanSide: PlayerType;
  winner: PlayerType | null;
  totalMoves: number;
  duration: number; // milliseconds
  goatsCaptured: number;
  moves: MoveRecord[];
  finalState: GameState;
}

export interface MoveRecord {
  moveNumber: number;
  player: PlayerType;
  move: Move;
  thinkingTime?: number; // milliseconds
  evaluation?: number;
  quality?: MoveQuality;
}

export interface PlayerStatistics {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageMovesPerGame: number;
  averageGameDuration: number; // seconds
  favoriteOpenings: Map<string, number>;
  commonMistakes: MoveQuality[];
  vsAIStats: {
    [difficulty: number]: {
      games: number;
      wins: number;
      winRate: number;
    };
  };
}

export class GameStatisticsTracker {
  private static readonly STORAGE_KEY = 'baghchal_game_history';
  private static readonly STATS_KEY = 'baghchal_player_stats';
  private static readonly MAX_STORED_GAMES = 100;

  /**
   * Save a completed game
   */
  public static saveGame(gameRecord: GameRecord): void {
    const history = this.getGameHistory();
    history.unshift(gameRecord);

    // Keep only last MAX_STORED_GAMES
    if (history.length > this.MAX_STORED_GAMES) {
      history.splice(this.MAX_STORED_GAMES);
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save game history:', error);
    }

    // Update player statistics
    this.updatePlayerStatistics(gameRecord);
  }

  /**
   * Get game history
   */
  public static getGameHistory(): GameRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load game history:', error);
      return [];
    }
  }

  /**
   * Get player statistics
   */
  public static getPlayerStatistics(): PlayerStatistics {
    try {
      const data = localStorage.getItem(this.STATS_KEY);
      if (data) {
        const stats = JSON.parse(data);
        // Convert favoriteOpenings from object to Map
        if (stats.favoriteOpenings) {
          stats.favoriteOpenings = new Map(Object.entries(stats.favoriteOpenings));
        }
        return stats;
      }
    } catch (error) {
      console.error('Failed to load player statistics:', error);
    }

    // Return default statistics
    return {
      totalGames: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      averageMovesPerGame: 0,
      averageGameDuration: 0,
      favoriteOpenings: new Map(),
      commonMistakes: [],
      vsAIStats: {},
    };
  }

  /**
   * Update player statistics with new game
   */
  private static updatePlayerStatistics(gameRecord: GameRecord): void {
    const stats = this.getPlayerStatistics();

    stats.totalGames++;

    // Update win/loss record
    if (gameRecord.winner === gameRecord.humanSide) {
      stats.wins++;
    } else if (gameRecord.winner !== null) {
      stats.losses++;
    } else {
      stats.draws++;
    }

    stats.winRate = stats.totalGames > 0 ? stats.wins / stats.totalGames : 0;

    // Update averages
    const totalMoves = stats.averageMovesPerGame * (stats.totalGames - 1) + gameRecord.totalMoves;
    stats.averageMovesPerGame = totalMoves / stats.totalGames;

    const totalDuration = stats.averageGameDuration * (stats.totalGames - 1) + gameRecord.duration / 1000;
    stats.averageGameDuration = totalDuration / stats.totalGames;

    // Track opening moves (first 3 goat placements)
    const openingMoves = gameRecord.moves
      .filter((m) => m.player === PlayerType.GOAT && m.moveNumber <= 3)
      .map((m) => `${m.move.to.row},${m.move.to.col}`)
      .join('-');

    if (openingMoves) {
      const count = stats.favoriteOpenings.get(openingMoves) || 0;
      stats.favoriteOpenings.set(openingMoves, count + 1);
    }

    // Track mistakes
    const mistakes = gameRecord.moves
      .filter((m) => m.quality && m.quality !== MoveQuality.GOOD && m.quality !== MoveQuality.BRILLIANT)
      .map((m) => m.quality!);
    stats.commonMistakes.push(...mistakes);

    // Keep only last 50 mistakes
    if (stats.commonMistakes.length > 50) {
      stats.commonMistakes = stats.commonMistakes.slice(-50);
    }

    // Update vs AI statistics
    if (gameRecord.mode !== 'human-vs-human' && gameRecord.aiDifficulty) {
      const difficulty = gameRecord.aiDifficulty;
      if (!stats.vsAIStats[difficulty]) {
        stats.vsAIStats[difficulty] = { games: 0, wins: 0, winRate: 0 };
      }

      stats.vsAIStats[difficulty].games++;
      if (gameRecord.winner === gameRecord.humanSide) {
        stats.vsAIStats[difficulty].wins++;
      }
      stats.vsAIStats[difficulty].winRate =
        stats.vsAIStats[difficulty].wins / stats.vsAIStats[difficulty].games;
    }

    // Save updated statistics
    try {
      // Convert Map to object for JSON serialization
      const statsToSave = {
        ...stats,
        favoriteOpenings: Object.fromEntries(stats.favoriteOpenings),
      };
      localStorage.setItem(this.STATS_KEY, JSON.stringify(statsToSave));
    } catch (error) {
      console.error('Failed to save player statistics:', error);
    }
  }

  /**
   * Clear all statistics
   */
  public static clearStatistics(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.STATS_KEY);
    } catch (error) {
      console.error('Failed to clear statistics:', error);
    }
  }

  /**
   * Export game history for ML training
   */
  public static exportForML(): string {
    const history = this.getGameHistory();
    return JSON.stringify(history, null, 2);
  }

  /**
   * Get games for ML training (filter by criteria)
   */
  public static getMLTrainingData(filters?: {
    minDifficulty?: number;
    playerSide?: PlayerType;
    minMoves?: number;
  }): GameRecord[] {
    let games = this.getGameHistory();

    if (filters?.minDifficulty) {
      games = games.filter((g) => (g.aiDifficulty || 0) >= filters.minDifficulty!);
    }

    if (filters?.playerSide) {
      games = games.filter((g) => g.humanSide === filters.playerSide);
    }

    if (filters?.minMoves) {
      games = games.filter((g) => g.totalMoves >= filters.minMoves!);
    }

    return games;
  }

  /**
   * Analyze player tendencies for adaptive AI
   */
  public static analyzePlayerTendencies(): {
    preferredOpenings: string[];
    commonWeaknesses: MoveQuality[];
    playStyle: 'aggressive' | 'defensive' | 'balanced';
    averageThinkingTime: number;
  } {
    const stats = this.getPlayerStatistics();
    const history = this.getGameHistory();

    // Get top 3 preferred openings
    const preferredOpenings = Array.from(stats.favoriteOpenings.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Analyze common weaknesses
    const weaknessCounts = new Map<MoveQuality, number>();
    stats.commonMistakes.forEach((quality) => {
      weaknessCounts.set(quality, (weaknessCounts.get(quality) || 0) + 1);
    });

    const commonWeaknesses = Array.from(weaknessCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // Determine play style based on move patterns
    let aggressiveCount = 0;
    let defensiveCount = 0;

    history.slice(0, 10).forEach((game) => {
      const captureMoves = game.moves.filter((m) => m.move.captured !== null).length;
      if (captureMoves > game.totalMoves * 0.3) {
        aggressiveCount++;
      } else {
        defensiveCount++;
      }
    });

    const playStyle =
      aggressiveCount > defensiveCount * 1.5
        ? 'aggressive'
        : defensiveCount > aggressiveCount * 1.5
        ? 'defensive'
        : 'balanced';

    // Calculate average thinking time
    const allThinkingTimes = history.flatMap((g) =>
      g.moves.filter((m) => m.thinkingTime).map((m) => m.thinkingTime!)
    );
    const averageThinkingTime =
      allThinkingTimes.length > 0
        ? allThinkingTimes.reduce((a, b) => a + b, 0) / allThinkingTimes.length
        : 0;

    return {
      preferredOpenings,
      commonWeaknesses,
      playStyle,
      averageThinkingTime,
    };
  }
}
