/**
 * Move Analysis Utilities
 * Analyze moves and provide hints/suggestions
 */

import { Game } from '@/core/Game';
import { Board } from '@/core/Board';
import { Rules } from '@/core/Rules';
import { Evaluator } from '@/ai/minimax/Evaluator';
import { Move, GameState, PlayerType, ValidMove, PieceType } from '@/core/types';

export enum MoveQuality {
  BRILLIANT = 'brilliant',
  GOOD = 'good',
  INACCURACY = 'inaccuracy',
  MISTAKE = 'mistake',
  BLUNDER = 'blunder',
}

export interface MoveAnalysis {
  move: Move;
  quality: MoveQuality;
  evaluation: number;
  comment: string;
  bestMove?: Move;
  bestEvaluation?: number;
}

export class MoveAnalyzer {
  /**
   * Analyze a move and determine its quality
   */
  public static analyzeMove(
    gameStateBefore: GameState,
    move: Move,
    playerType: PlayerType
  ): MoveAnalysis {
    // Get evaluation before move
    const evalBefore = Evaluator.evaluate(gameStateBefore, playerType);

    // Apply move and get evaluation after
    const game = new Game();
    game.loadState(gameStateBefore);
    game.makeMove(move);
    const gameStateAfter = game.getState();
    const evalAfter = Evaluator.evaluate(gameStateAfter, playerType);

    // Calculate evaluation change
    const evalChange = evalAfter - evalBefore;

    // Get best move for comparison
    const validMoves = this.getTopMoves(gameStateBefore, playerType, 3);
    const bestMove = validMoves[0];
    const bestEvaluation = bestMove ? this.evaluateMove(gameStateBefore, bestMove.move, playerType) : evalAfter;

    // Determine move quality based on evaluation loss
    const evalLoss = bestEvaluation - evalAfter;
    const quality = this.getMoveQuality(evalLoss, evalChange);
    const comment = this.getMoveComment(quality, evalChange, evalLoss);

    return {
      move,
      quality,
      evaluation: evalAfter,
      comment,
      bestMove: bestMove?.move,
      bestEvaluation,
    };
  }

  /**
   * Get top N moves for a position
   */
  public static getTopMoves(
    gameState: GameState,
    playerType: PlayerType,
    count: number = 3
  ): Array<{ move: Move; evaluation: number }> {
    const game = new Game();
    game.loadState(gameState);
    const validMoves = game.getValidMoves();

    // Evaluate each move
    const evaluatedMoves = validMoves.map((vm) => {
      const evaluation = this.evaluateMove(gameState, vm.move, playerType);
      return { move: vm.move, evaluation };
    });

    // Sort by evaluation (best first)
    evaluatedMoves.sort((a, b) => b.evaluation - a.evaluation);

    return evaluatedMoves.slice(0, count);
  }

  /**
   * Evaluate a single move using a short minimax lookahead so the opponent's
   * best response is considered (prevents suggesting moves that get captured).
   */
  private static evaluateMove(
    gameState: GameState,
    move: Move,
    playerType: PlayerType
  ): number {
    const game = new Game();
    game.loadState(gameState);
    game.makeMove(move);
    const afterState = game.getState();

    // Depth-2 lookahead: evaluate from the opponent's perspective, then negate.
    // This catches immediate punishments like "place goat → tiger captures it".
    return this.minimaxEval(afterState, 2, playerType);
  }

  /**
   * Simple minimax (no alpha-beta) for hint evaluation.
   * Kept shallow (depth 2-3) so hints are fast.
   */
  private static minimaxEval(
    state: GameState,
    depth: number,
    forPlayer: PlayerType
  ): number {
    if (depth === 0) {
      return Evaluator.evaluate(state, forPlayer);
    }

    const game = new Game();
    game.loadState(state);

    if (game.isGameOver()) {
      return Evaluator.evaluate(state, forPlayer);
    }

    const validMoves = game.getValidMoves();
    if (validMoves.length === 0) {
      return Evaluator.evaluate(state, forPlayer);
    }

    const isMaximizing = state.currentPlayer === forPlayer;
    let bestEval = isMaximizing ? -Infinity : Infinity;

    for (const vm of validMoves) {
      const child = game.clone();
      child.makeMove(vm.move);
      const childEval = this.minimaxEval(child.getState(), depth - 1, forPlayer);

      if (isMaximizing) {
        bestEval = Math.max(bestEval, childEval);
      } else {
        bestEval = Math.min(bestEval, childEval);
      }
    }

    return bestEval;
  }

  /**
   * Determine move quality based on evaluation loss
   */
  private static getMoveQuality(evalLoss: number, evalChange: number): MoveQuality {
    // Brilliant: Significant improvement, best move
    if (evalChange > 200 && evalLoss < 50) {
      return MoveQuality.BRILLIANT;
    }

    // Good: Small or no evaluation loss
    if (evalLoss < 100) {
      return MoveQuality.GOOD;
    }

    // Inaccuracy: Small evaluation loss
    if (evalLoss < 200) {
      return MoveQuality.INACCURACY;
    }

    // Mistake: Moderate evaluation loss
    if (evalLoss < 400) {
      return MoveQuality.MISTAKE;
    }

    // Blunder: Large evaluation loss
    return MoveQuality.BLUNDER;
  }

  /**
   * Get comment for move quality
   */
  private static getMoveComment(
    quality: MoveQuality,
    evalChange: number,
    evalLoss: number
  ): string {
    switch (quality) {
      case MoveQuality.BRILLIANT:
        return '⚡ Brilliant move! Best choice in this position.';
      case MoveQuality.GOOD:
        return '✓ Good move. Maintains your advantage.';
      case MoveQuality.INACCURACY:
        return '!? Inaccuracy. There was a slightly better move.';
      case MoveQuality.MISTAKE:
        return '? Mistake. This weakens your position.';
      case MoveQuality.BLUNDER:
        return '?? Blunder! This is a serious error.';
    }
  }

  /**
   * Get hint for current position
   */
  public static getHint(gameState: GameState, playerType: PlayerType): string {
    const topMoves = this.getTopMoves(gameState, playerType, 1);

    if (topMoves.length === 0) {
      return 'No legal moves available.';
    }

    const bestMove = topMoves[0].move;
    const evaluation = topMoves[0].evaluation;

    let hint = '💡 Hint: ';

    if (bestMove.from === null) {
      // Placement move
      hint += `Place at (${bestMove.to.row}, ${bestMove.to.col})`;
    } else if (bestMove.captured) {
      // Capture move
      hint += `Move from (${bestMove.from.row}, ${bestMove.from.col}) to (${bestMove.to.row}, ${bestMove.to.col}) to capture a goat!`;
    } else {
      // Regular move
      hint += `Move from (${bestMove.from.row}, ${bestMove.from.col}) to (${bestMove.to.row}, ${bestMove.to.col})`;
    }

    // Add evaluation context (relative to material baseline)
    const baseline = playerType === PlayerType.GOAT
      ? (20 - gameState.goatsCaptured) * 50
      : gameState.goatsCaptured * 1000;
    const relEval = evaluation - baseline;

    if (relEval > 1000) {
      hint += ' - This leads to a winning position!';
    } else if (relEval > 300) {
      hint += ' - This gives you a strong advantage.';
    } else if (relEval > -100) {
      hint += ' - This maintains your position.';
    } else if (relEval > -500) {
      hint += ' - This minimizes your disadvantage.';
    } else {
      hint += ' - This is the best defense available.';
    }

    return hint;
  }

  /**
   * Get strategic advice for current position
   */
  public static getStrategicAdvice(
    gameState: GameState,
    playerType: PlayerType
  ): string {
    const evaluation = Evaluator.evaluate(gameState, playerType);

    // Baseline: evaluate the starting position for this player so advice is
    // relative to "neutral". Without this, the raw goat material score (20×50 = 1000)
    // would immediately trigger "You're winning" at game start.
    const baseline = playerType === PlayerType.GOAT
      ? (20 - gameState.goatsCaptured) * 50  // GOAT_ALIVE weight × living goats
      : gameState.goatsCaptured * 1000;        // GOAT_CAPTURED weight × captures
    const relativeEval = evaluation - baseline;

    if (playerType === PlayerType.TIGER) {
      if (gameState.goatsCaptured >= 4) {
        return '🎯 One more capture to win! Focus on hunting the remaining goats.';
      } else if (gameState.goatsCaptured >= 3) {
        return '💪 You\'re close! Keep pressuring the goats.';
      } else if (relativeEval > 500) {
        return '✓ You\'re winning. Maintain pressure and create capture opportunities.';
      } else if (relativeEval < -500) {
        return '⚠️ You\'re losing. Try to avoid getting trapped while looking for captures.';
      } else {
        return '→ Control the center and create threats. Force goats into vulnerable positions.';
      }
    } else {
      // Goat advice
      if (gameState.goatsCaptured >= 4) {
        return '⚠️ Critical! One more capture loses the game. Play carefully!';
      } else if (gameState.goatsCaptured >= 3) {
        return '😰 Under pressure. Focus on blocking tigers, not risky moves.';
      } else if (relativeEval > 500) {
        return '✓ You\'re winning. Tighten the trap around the tigers.';
      } else if (relativeEval < -500) {
        return '⚠️ Tigers are dominating. Regroup and build defensive walls.';
      } else {
        return '→ Build formations and trap tigers. Work together to restrict their movement.';
      }
    }
  }
}
