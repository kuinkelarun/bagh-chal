/**
 * Abstract AI Engine interface
 * All AI implementations must conform to this interface
 */

import { GameState, Move, PlayerType } from '@/core/types';

export interface AIEngine {
  /**
   * Get the best move for the current game state
   * @param gameState Current game state
   * @param playerType Which player the AI is playing as
   * @returns Promise resolving to the best move
   */
  getMove(gameState: GameState, playerType: PlayerType): Promise<Move>;

  /**
   * Set the difficulty level (1-5)
   * @param level Difficulty level
   */
  setDifficulty(level: number): void;

  /**
   * Stop current computation (for cancellation)
   */
  stop(): void;

  /**
   * Get the current evaluation of a position
   * @param gameState Game state to evaluate
   * @param playerType Player to evaluate for
   * @returns Evaluation score (higher is better for playerType)
   */
  evaluate?(gameState: GameState, playerType: PlayerType): number;
}

/**
 * AI Configuration
 */
export interface AIConfig {
  algorithm: 'minimax' | 'mcts' | 'neural' | 'adaptive';
  level: number; // 1-5
  depth?: number; // Search depth (for minimax)
  timeLimit?: number; // Time limit in ms
  useOpeningBook?: boolean;
  randomness?: number; // 0-1, amount of randomness to add
}

/**
 * AI Move Result with metadata
 */
export interface AIMoveResult {
  move: Move;
  evaluation: number;
  nodesSearched?: number;
  searchDepth?: number;
  thinkingTime?: number;
  principalVariation?: Move[]; // Best move sequence
}

/**
 * Default AI configurations for each difficulty level
 */
export const AI_PRESETS: Record<number, AIConfig> = {
  1: {
    // Easy - shallow search, high randomness on non-capture moves
    algorithm: 'minimax',
    level: 1,
    depth: 3,
    timeLimit: 2000,
    useOpeningBook: false,
    randomness: 0.4,
  },
  2: {
    // Medium - moderate search, some randomness
    algorithm: 'minimax',
    level: 2,
    depth: 4,
    timeLimit: 5000,
    useOpeningBook: false,
    randomness: 0.15,
  },
  3: {
    // Hard - deep search, no randomness, uses opening book
    algorithm: 'minimax',
    level: 3,
    depth: 6,
    timeLimit: 10000,
    useOpeningBook: true,
    randomness: 0,
  },
  4: {
    // Expert - very deep search, perfect play
    algorithm: 'minimax',
    level: 4,
    depth: 10,
    timeLimit: 15000,
    useOpeningBook: true,
    randomness: 0,
  },
  5: {
    // Adaptive (placeholder for ML)
    algorithm: 'adaptive',
    level: 5,
    depth: 8,
    timeLimit: 12000,
    useOpeningBook: true,
    randomness: 0,
  },
};
