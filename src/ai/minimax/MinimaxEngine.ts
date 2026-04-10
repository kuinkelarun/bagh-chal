/**
 * Minimax AI Engine with Alpha-Beta Pruning
 * Implements intelligent game tree search for Bagh Chal
 */

import { AIEngine, AIConfig, AIMoveResult } from '../AIEngine';
import { Evaluator } from './Evaluator';
import { openingBook } from './openingBook';
import { Game } from '@/core/Game';
import { Rules } from '@/core/Rules';
import { Board } from '@/core/Board';
import {
  GameState,
  Move,
  PlayerType,
  ValidMove,
  PieceType,
} from '@/core/types';

interface TranspositionEntry {
  evaluation: number;
  depth: number;
  flag: 'exact' | 'lowerbound' | 'upperbound';
  bestMove?: Move;
}

export class MinimaxEngine implements AIEngine {
  private config: AIConfig;
  private shouldStop: boolean;
  private nodesSearched: number;
  private transpositionTable: Map<string, TranspositionEntry>;
  private startTime: number;
  private maxTime: number;

  constructor(config: AIConfig) {
    this.config = config;
    this.shouldStop = false;
    this.nodesSearched = 0;
    this.transpositionTable = new Map();
    this.startTime = 0;
    this.maxTime = config.timeLimit || 5000;
  }

  /**
   * Get the best move using Minimax with alpha-beta pruning
   */
  public async getMove(gameState: GameState, playerType: PlayerType): Promise<Move> {
    this.shouldStop = false;
    this.nodesSearched = 0;
    this.transpositionTable.clear();
    this.startTime = Date.now();

    // Check opening book first
    if (this.config.useOpeningBook) {
      const openingMove = this.getOpeningMove(gameState, playerType);
      if (openingMove) {
        // Validate that the opening book move is legal
        const game = new Game();
        game.loadState(gameState);
        const validMoves = game.getValidMoves();

        const isValid = validMoves.some(vm =>
          this.movesEqual(vm.move, openingMove)
        );

        if (isValid) {
          console.log('Using opening book move');
          return openingMove;
        } else {
          console.log('Opening book move invalid, falling back to search');
        }
      }
    }

    // Use iterative deepening
    let bestMove: Move | null = null;
    const maxDepth = this.config.depth || 4;

    try {
      for (let depth = 1; depth <= maxDepth; depth++) {
        if (this.shouldStop || this.isTimeUp()) break;

        const result = this.search(gameState, depth, playerType);
        if (result.move) {
          bestMove = result.move;
          console.log(
            `Depth ${depth}: eval=${result.evaluation}, nodes=${this.nodesSearched}`
          );
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    }

    // If no move found, get any valid move
    if (!bestMove) {
      const game = new Game();
      game.loadState(gameState);
      const validMoves = game.getValidMoves();

      if (validMoves.length > 0) {
        bestMove = validMoves[0].move;
      } else {
        throw new Error('No valid moves available');
      }
    }

    // Add randomness for lower difficulties
    if (this.config.randomness && Math.random() < this.config.randomness) {
      const game = new Game();
      game.loadState(gameState);
      const validMoves = game.getValidMoves();

      if (validMoves.length > 0) {
        bestMove = validMoves[Math.floor(Math.random() * validMoves.length)].move;
        console.log('Using random move for variety');
      }
    }

    const thinkingTime = Date.now() - this.startTime;
    console.log(`AI thinking time: ${thinkingTime}ms, nodes: ${this.nodesSearched}`);

    return bestMove;
  }

  /**
   * Main search function with iterative deepening
   */
  private search(
    gameState: GameState,
    depth: number,
    playerType: PlayerType
  ): AIMoveResult {
    const alpha = -Infinity;
    const beta = Infinity;

    const result = this.minimax(gameState, depth, alpha, beta, playerType, playerType);

    return {
      move: result.bestMove!,
      evaluation: result.evaluation,
      nodesSearched: this.nodesSearched,
      searchDepth: depth,
    };
  }

  /**
   * Minimax with alpha-beta pruning
   */
  private minimax(
    gameState: GameState,
    depth: number,
    alpha: number,
    beta: number,
    currentPlayer: PlayerType,
    maximizingPlayer: PlayerType
  ): { evaluation: number; bestMove?: Move } {
    this.nodesSearched++;

    // Check time limit
    if (this.shouldStop || this.isTimeUp()) {
      return { evaluation: 0 };
    }

    // Check transposition table
    const stateKey = this.getStateKey(gameState);
    const ttEntry = this.transpositionTable.get(stateKey);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'exact') {
        return { evaluation: ttEntry.evaluation, bestMove: ttEntry.bestMove };
      } else if (ttEntry.flag === 'lowerbound') {
        alpha = Math.max(alpha, ttEntry.evaluation);
      } else if (ttEntry.flag === 'upperbound') {
        beta = Math.min(beta, ttEntry.evaluation);
      }

      if (alpha >= beta) {
        return { evaluation: ttEntry.evaluation, bestMove: ttEntry.bestMove };
      }
    }

    // Terminal node check (game over or depth limit)
    const game = new Game();
    game.loadState(gameState);

    if (depth === 0 || game.isGameOver()) {
      const evaluation = Evaluator.evaluate(gameState, maximizingPlayer);
      return { evaluation };
    }

    // Get valid moves
    const validMoves = game.getValidMoves();
    if (validMoves.length === 0) {
      // No moves available (game over)
      const evaluation = currentPlayer === maximizingPlayer ? -100000 : 100000;
      return { evaluation };
    }

    // Order moves (captures first, then by quick eval)
    const orderedMoves = this.orderMoves(validMoves, gameState, currentPlayer);

    const isMaximizing = currentPlayer === maximizingPlayer;
    let bestEval = isMaximizing ? -Infinity : Infinity;
    let bestMove: Move | undefined;

    for (const validMove of orderedMoves) {
      // Make move
      const newGame = game.clone();
      newGame.makeMove(validMove.move);
      const newState = newGame.getState();

      // Recursive call
      const result = this.minimax(
        newState,
        depth - 1,
        alpha,
        beta,
        newState.currentPlayer,
        maximizingPlayer
      );

      const evaluation = result.evaluation;

      // Update best move
      if (isMaximizing) {
        if (evaluation > bestEval) {
          bestEval = evaluation;
          bestMove = validMove.move;
        }
        alpha = Math.max(alpha, evaluation);
      } else {
        if (evaluation < bestEval) {
          bestEval = evaluation;
          bestMove = validMove.move;
        }
        beta = Math.min(beta, evaluation);
      }

      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    // Store in transposition table
    const flag: 'exact' | 'lowerbound' | 'upperbound' =
      bestEval <= alpha ? 'upperbound' : bestEval >= beta ? 'lowerbound' : 'exact';

    this.transpositionTable.set(stateKey, {
      evaluation: bestEval,
      depth,
      flag,
      bestMove,
    });

    return { evaluation: bestEval, bestMove };
  }

  /**
   * Order moves for better alpha-beta pruning
   */
  private orderMoves(
    validMoves: ValidMove[],
    gameState: GameState,
    player: PlayerType
  ): ValidMove[] {
    // Sort moves: captures first, then by quick evaluation
    return validMoves.sort((a, b) => {
      // Captures first
      if (a.isCapture && !b.isCapture) return -1;
      if (!a.isCapture && b.isCapture) return 1;

      // Then by quick eval
      if (a.evaluation !== undefined && b.evaluation !== undefined) {
        return b.evaluation - a.evaluation;
      }

      return 0;
    });
  }

  /**
   * Get state key for transposition table
   */
  private getStateKey(gameState: GameState): string {
    // Simple hash: board state + current player + phase
    const boardStr = gameState.board.map((row) => row.join('')).join('');
    return `${boardStr}-${gameState.currentPlayer}-${gameState.phase}-${gameState.goatsCaptured}`;
  }

  /**
   * Check if time is up
   */
  private isTimeUp(): boolean {
    return Date.now() - this.startTime > this.maxTime;
  }

  /**
   * Get opening book move
   */
  private getOpeningMove(gameState: GameState, playerType: PlayerType): Move | null {
    if (!openingBook.shouldUseOpeningBook(gameState.turnNumber, playerType)) {
      return null;
    }

    const board = new Board();
    board.fromArray(gameState.board);

    if (playerType === PlayerType.TIGER) {
      const tigers = board.getPiecesOfType(PieceType.TIGER);
      return openingBook.getTigerOpening(tigers);
    } else {
      // Goat opening
      const occupied = new Set<string>();
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (gameState.board[row][col] !== PieceType.EMPTY) {
            occupied.add(`${row},${col}`);
          }
        }
      }
      return openingBook.getGoatOpening(gameState.turnNumber, occupied);
    }
  }

  /**
   * Check if two moves are equal
   */
  private movesEqual(move1: Move, move2: Move): boolean {
    // Compare from positions
    if (move1.from === null && move2.from === null) {
      // Both placement moves
    } else if (move1.from === null || move2.from === null) {
      return false; // One is placement, one is not
    } else if (
      move1.from.row !== move2.from.row ||
      move1.from.col !== move2.from.col
    ) {
      return false; // Different from positions
    }

    // Compare to positions
    if (move1.to.row !== move2.to.row || move1.to.col !== move2.to.col) {
      return false;
    }

    // Compare captured positions
    if (move1.captured === null && move2.captured === null) {
      return true;
    } else if (move1.captured === null || move2.captured === null) {
      return false;
    } else {
      return (
        move1.captured.row === move2.captured.row &&
        move1.captured.col === move2.captured.col
      );
    }
  }

  /**
   * Set difficulty level
   */
  public setDifficulty(level: number): void {
    this.config.level = level;

    // Adjust depth based on difficulty
    switch (level) {
      case 1:
        this.config.depth = 2;
        this.config.randomness = 0.2;
        break;
      case 2:
        this.config.depth = 4;
        this.config.randomness = 0.1;
        break;
      case 3:
        this.config.depth = 6;
        this.config.randomness = 0.05;
        break;
      case 4:
        this.config.depth = 8;
        this.config.randomness = 0;
        break;
      default:
        this.config.depth = 4;
    }
  }

  /**
   * Stop current computation
   */
  public stop(): void {
    this.shouldStop = true;
  }

  /**
   * Evaluate current position
   */
  public evaluate(gameState: GameState, playerType: PlayerType): number {
    return Evaluator.evaluate(gameState, playerType);
  }
}
