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
  Position,
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

    // Search all moves and collect evaluations
    const maxDepth = this.config.depth || 4;
    const moveEvals = this.searchAllMoves(gameState, maxDepth, playerType);

    if (moveEvals.size === 0) {
      // Fallback: get any valid move
      const game = new Game();
      game.loadState(gameState);
      const validMoves = game.getValidMoves();
      if (validMoves.length > 0) {
        return validMoves[0].move;
      }
      throw new Error('No valid moves available');
    }

    // Select move using softmax (captures always played, randomness only on non-captures)
    const bestMove = this.selectSoftmaxMove(moveEvals, this.config.randomness || 0);

    const thinkingTime = Date.now() - this.startTime;
    console.log(`AI thinking time: ${thinkingTime}ms, nodes: ${this.nodesSearched}`);

    return bestMove;
  }

  /**
   * Search all moves to the given depth and return evaluations + capture flags
   */
  private searchAllMoves(
    gameState: GameState,
    maxDepth: number,
    playerType: PlayerType
  ): Map<string, { evaluation: number; isCapture: boolean; move: Move }> {
    const game = new Game();
    game.loadState(gameState);
    const validMoves = game.getValidMoves();

    const moveEvals = new Map<string, { evaluation: number; isCapture: boolean; move: Move }>();

    // Use iterative deepening to get progressively better evaluations
    for (let depth = 1; depth <= maxDepth; depth++) {
      if (this.shouldStop || this.isTimeUp()) break;

      for (const vm of validMoves) {
        if (this.shouldStop || this.isTimeUp()) break;

        const newGame = game.clone();
        newGame.makeMove(vm.move);
        const newState = newGame.getState();

        const result = this.minimax(
          newState,
          depth - 1,
          -Infinity,
          Infinity,
          newState.currentPlayer,
          playerType
        );

        const key = this.getMoveKey(vm.move);
        moveEvals.set(key, {
          evaluation: result.evaluation,
          isCapture: !!vm.isCapture,
          move: vm.move,
        });
      }

      console.log(`Depth ${depth}: evaluated ${validMoves.length} moves, nodes=${this.nodesSearched}`);
    }

    return moveEvals;
  }

  /**
   * Select a move using softmax distribution.
   * ALWAYS plays a capture move if one exists (never randomizes away captures).
   * Only applies softmax randomness to non-capture moves.
   */
  private selectSoftmaxMove(
    moveEvals: Map<string, { evaluation: number; isCapture: boolean; move: Move }>,
    randomness: number
  ): Move {
    const entries = Array.from(moveEvals.values());

    // Separate captures from non-captures
    const captures = entries.filter(e => e.isCapture);
    const nonCaptures = entries.filter(e => !e.isCapture);

    // If there are capture moves, ALWAYS pick the best capture
    if (captures.length > 0) {
      captures.sort((a, b) => b.evaluation - a.evaluation);
      console.log(`Playing best capture move (eval: ${captures[0].evaluation})`);
      return captures[0].move;
    }

    // No captures — apply softmax selection among non-capture moves
    if (randomness <= 0 || nonCaptures.length <= 1) {
      // Zero randomness or only one move: pick the best
      entries.sort((a, b) => b.evaluation - a.evaluation);
      return entries[0].move;
    }

    // Softmax temperature: lower randomness → lower temperature → more deterministic
    // randomness 0.4 (Easy) → temperature ~2.0; randomness 0.15 (Medium) → temperature ~0.75
    const temperature = randomness * 5;

    // Find max eval for numerical stability
    const maxEval = Math.max(...nonCaptures.map(e => e.evaluation));

    // Compute softmax probabilities
    const expValues = nonCaptures.map(e => Math.exp((e.evaluation - maxEval) / temperature));
    const sumExp = expValues.reduce((sum, v) => sum + v, 0);
    const probabilities = expValues.map(v => v / sumExp);

    // Sample from the distribution
    const rand = Math.random();
    let cumulative = 0;
    for (let i = 0; i < nonCaptures.length; i++) {
      cumulative += probabilities[i];
      if (rand <= cumulative) {
        console.log(`Softmax selected move ${i} (eval: ${nonCaptures[i].evaluation}, prob: ${(probabilities[i] * 100).toFixed(1)}%)`);
        return nonCaptures[i].move;
      }
    }

    // Fallback (shouldn't happen)
    return nonCaptures[nonCaptures.length - 1].move;
  }

  /**
   * Create a string key for a move (for Map storage)
   */
  private getMoveKey(move: Move): string {
    const from = move.from ? `${move.from.row},${move.from.col}` : 'null';
    const to = `${move.to.row},${move.to.col}`;
    const cap = move.captured ? `${move.captured.row},${move.captured.col}` : 'null';
    return `${from}->${to}|${cap}`;
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
      return openingBook.getGoatOpening(gameState.turnNumber, occupied, gameState.board);
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

    switch (level) {
      case 1:
        this.config.depth = 2;
        this.config.randomness = 0.4;
        this.config.useOpeningBook = false;
        this.maxTime = 2000;
        break;
      case 2:
        this.config.depth = 4;
        this.config.randomness = 0.15;
        this.config.useOpeningBook = false;
        this.maxTime = 5000;
        break;
      case 3:
        this.config.depth = 6;
        this.config.randomness = 0;
        this.config.useOpeningBook = true;
        this.maxTime = 10000;
        break;
      case 4:
        this.config.depth = 10;
        this.config.randomness = 0;
        this.config.useOpeningBook = true;
        this.maxTime = 15000;
        break;
      default:
        this.config.depth = 4;
        this.config.randomness = 0.15;
        this.maxTime = 5000;
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
