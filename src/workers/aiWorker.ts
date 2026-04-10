/**
 * AI Worker - Runs AI computation in background thread
 * Prevents UI blocking during deep search
 */

import { AIFactory } from '@/ai/AIFactory';
import { GameState, Move, PlayerType } from '@/core/types';

// Worker message types
interface AIWorkerRequest {
  type: 'compute-move';
  gameState: GameState;
  playerType: PlayerType;
  difficulty: number;
}

interface AIWorkerResponse {
  type: 'move-computed' | 'error';
  move?: Move;
  error?: string;
  thinkingTime?: number;
  nodesSearched?: number;
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<AIWorkerRequest>) => {
  const { type, gameState, playerType, difficulty } = event.data;

  if (type === 'compute-move') {
    try {
      const startTime = Date.now();

      // Create AI engine
      const aiEngine = AIFactory.createFromLevel(difficulty);

      // Compute best move
      const move = await aiEngine.getMove(gameState, playerType);

      const thinkingTime = Date.now() - startTime;

      // Send result back to main thread
      const response: AIWorkerResponse = {
        type: 'move-computed',
        move,
        thinkingTime,
      };

      self.postMessage(response);
    } catch (error) {
      // Send error back to main thread
      const response: AIWorkerResponse = {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      self.postMessage(response);
    }
  }
};

// Required for TypeScript in worker context
export {};
