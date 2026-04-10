/**
 * Adaptive AI Engine
 * Learns from player patterns and adjusts strategy dynamically
 * Combines Minimax search with player profiling
 */

import { AIEngine, AIConfig } from '../AIEngine';
import { MinimaxEngine } from '../minimax/MinimaxEngine';
import { Evaluator } from '../minimax/Evaluator';
import { PlayerProfile } from './PlayerProfile';
import { Game } from '@/core/Game';
import { GameState, Move, PlayerType } from '@/core/types';

export class AdaptiveEngine implements AIEngine {
  private minimaxEngine: MinimaxEngine;
  private playerProfile: PlayerProfile;
  private config: AIConfig;
  private adaptationLevel: number; // 0-1, how much to adapt vs play optimally

  constructor(config: AIConfig) {
    this.config = config;
    this.minimaxEngine = new MinimaxEngine(config);
    this.playerProfile = new PlayerProfile();
    this.adaptationLevel = 0.6; // 60% adaptation, 40% optimal play
  }

  /**
   * Get move with adaptation
   */
  public async getMove(gameState: GameState, playerType: PlayerType): Promise<Move> {
    // Update player profile with latest data
    this.playerProfile.update();

    // Get optimal move from Minimax
    const optimalMove = await this.minimaxEngine.getMove(gameState, playerType);

    // Decide whether to adapt or play optimally
    if (Math.random() < this.adaptationLevel) {
      // Try to exploit player weaknesses
      const adaptedMove = this.getAdaptedMove(gameState, playerType, optimalMove);
      if (adaptedMove) {
        console.log('🎯 Adaptive AI: Exploiting player pattern');
        return adaptedMove;
      }
    }

    // Fall back to optimal play
    console.log('🤖 Adaptive AI: Playing optimally');
    return optimalMove;
  }

  /**
   * Get move adapted to player's weaknesses
   */
  private getAdaptedMove(
    gameState: GameState,
    playerType: PlayerType,
    optimalMove: Move
  ): Move | null {
    const game = new Game();
    game.loadState(gameState);
    const validMoves = game.getValidMoves();

    if (validMoves.length === 0) return null;

    // Get player's likely moves for counter-strategy
    const allMoves = validMoves.map((vm) => vm.move);
    const likelyMoves = this.playerProfile.predictLikelyMoves(allMoves);

    // Get player's weaknesses
    const weaknesses = this.playerProfile.getWeaknesses();
    const pattern = this.playerProfile.getPattern();

    // Apply adaptation strategies based on weaknesses
    for (const weakness of weaknesses) {
      if (weakness.confidence < 0.6) continue; // Skip low-confidence weaknesses

      switch (weakness.type) {
        case 'opening':
          // Counter predictable openings
          if (gameState.turnNumber < 10) {
            const counterMove = this.counterOpening(validMoves, pattern);
            if (counterMove) return counterMove;
          }
          break;

        case 'midgame':
          // Create complex tactical positions
          const tacticalMove = this.createTacticalPressure(validMoves, gameState, playerType);
          if (tacticalMove) return tacticalMove;
          break;

        case 'endgame':
          // Aggressive endgame exploitation
          if (gameState.goatsCaptured >= 3 || gameState.goatsRemaining === 0) {
            const aggressiveMove = this.playAggressive(validMoves, gameState);
            if (aggressiveMove) return aggressiveMove;
          }
          break;
      }
    }

    // If no specific adaptation, try to exploit player's most likely move
    if (likelyMoves.length > 0) {
      const counterMove = this.counterLikelyMove(validMoves, likelyMoves[0], gameState, playerType);
      if (counterMove) return counterMove;
    }

    return null; // No adaptation found, use optimal move
  }

  /**
   * Counter predictable opening
   */
  private counterOpening(
    validMoves: Array<{ move: Move; isCapture: boolean }>,
    pattern: any
  ): Move | null {
    // If player tends to place goats in center, take center control first
    if (pattern.centerControl > 0.6) {
      const centerMoves = validMoves.filter((vm) => {
        const pos = vm.move.to;
        return pos.row === 2 && pos.col === 2;
      });
      if (centerMoves.length > 0) {
        return centerMoves[0].move;
      }
    }

    // If player avoids center, dominate it
    if (pattern.centerControl < 0.4) {
      const centerMoves = validMoves.filter((vm) => {
        const pos = vm.move.to;
        return pos.row >= 1 && pos.row <= 3 && pos.col >= 1 && pos.col <= 3;
      });
      if (centerMoves.length > 0) {
        return centerMoves[0].move;
      }
    }

    return null;
  }

  /**
   * Create tactical pressure (complex positions)
   */
  private createTacticalPressure(
    validMoves: Array<{ move: Move; isCapture: boolean }>,
    gameState: GameState,
    playerType: PlayerType
  ): Move | null {
    // Prioritize moves that create multiple threats
    const threateningMoves = validMoves.filter((vm) => {
      const game = new Game();
      game.loadState(gameState);
      game.makeMove(vm.move);
      const newState = game.getState();

      // Count new threats after this move
      const threats = this.countThreats(newState, playerType);
      return threats >= 2; // Multiple simultaneous threats
    });

    if (threateningMoves.length > 0) {
      return threateningMoves[0].move;
    }

    return null;
  }

  /**
   * Play aggressively (prioritize captures and attacks)
   */
  private playAggressive(
    validMoves: Array<{ move: Move; isCapture: boolean }>,
    gameState: GameState
  ): Move | null {
    // Prioritize captures
    const captureMoves = validMoves.filter((vm) => vm.isCapture);
    if (captureMoves.length > 0) {
      return captureMoves[0].move;
    }

    // Otherwise, move closer to goats for threats
    const threateningMoves = validMoves.filter((vm) => {
      if (!vm.move.to) return false;

      // Check if move gets closer to any goat
      const game = new Game();
      game.loadState(gameState);
      const board = game.getBoard();
      const goats = board.getPiecesOfType('goat' as any);

      return goats.some((goatPos) => {
        const distBefore = vm.move.from
          ? Math.abs(goatPos.row - vm.move.from.row) + Math.abs(goatPos.col - vm.move.from.col)
          : Infinity;
        const distAfter = Math.abs(goatPos.row - vm.move.to.row) + Math.abs(goatPos.col - vm.move.to.col);
        return distAfter < distBefore;
      });
    });

    if (threateningMoves.length > 0) {
      return threateningMoves[0].move;
    }

    return null;
  }

  /**
   * Counter the player's likely next move
   */
  private counterLikelyMove(
    validMoves: Array<{ move: Move; isCapture: boolean }>,
    likelyPlayerMove: Move,
    gameState: GameState,
    playerType: PlayerType
  ): Move | null {
    // Find moves that make the player's likely move less effective
    const counterMoves = validMoves.map((vm) => {
      const game = new Game();
      game.loadState(gameState);

      // Make our move
      game.makeMove(vm.move);

      // Simulate player's likely move
      const afterOurMove = game.getState();
      if (this.isMoveLegal(afterOurMove, likelyPlayerMove)) {
        game.makeMove(likelyPlayerMove);
        const afterBothMoves = game.getState();

        // Evaluate position
        const evaluation = Evaluator.evaluate(afterBothMoves, playerType);
        return { move: vm.move, evaluation };
      }

      return null;
    }).filter((m) => m !== null) as Array<{ move: Move; evaluation: number }>;

    // Sort by evaluation
    counterMoves.sort((a, b) => b.evaluation - a.evaluation);

    return counterMoves.length > 0 ? counterMoves[0].move : null;
  }

  /**
   * Check if a move is legal in a given state
   */
  private isMoveLegal(gameState: GameState, move: Move): boolean {
    const game = new Game();
    game.loadState(gameState);
    return game.isValidMove(move);
  }

  /**
   * Count threats in a position
   */
  private countThreats(gameState: GameState, playerType: PlayerType): number {
    // Simple threat counting (goats that can be captured)
    const game = new Game();
    game.loadState(gameState);
    const validMoves = game.getValidMoves();
    return validMoves.filter((vm) => vm.isCapture).length;
  }

  /**
   * Set difficulty level
   */
  public setDifficulty(level: number): void {
    this.config.level = level;
    this.minimaxEngine.setDifficulty(level);

    // Adjust adaptation level based on difficulty
    // Higher difficulty = more adaptation
    this.adaptationLevel = 0.4 + level * 0.1; // 0.5 at level 1, 0.9 at level 5
  }

  /**
   * Stop computation
   */
  public stop(): void {
    this.minimaxEngine.stop();
  }

  /**
   * Evaluate position
   */
  public evaluate(gameState: GameState, playerType: PlayerType): number {
    return this.minimaxEngine.evaluate(gameState, playerType);
  }

  /**
   * Get adaptation insight (for debugging/display)
   */
  public getAdaptationInsight(): string {
    return this.playerProfile.suggestAdaptation();
  }

  /**
   * Get player weaknesses (for display)
   */
  public getPlayerWeaknesses() {
    return this.playerProfile.getWeaknesses();
  }
}
