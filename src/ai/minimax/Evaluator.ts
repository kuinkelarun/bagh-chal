/**
 * Position evaluation for Bagh Chal
 * Evaluates board positions for both Tigers and Goats
 */

import { Board } from '@/core/Board';
import { Rules } from '@/core/Rules';
import { GameState, PlayerType, PieceType, Position, GamePhase } from '@/core/types';

export class Evaluator {
  // Evaluation weights
  private static readonly WEIGHTS = {
    // Tiger weights
    GOAT_CAPTURED: 1000,
    TIGER_MOBILITY: 15,
    GOAT_THREATENED: 30,
    CENTER_CONTROL: 25,
    TIGER_BLOCKED: -50,
    TIGER_CORNER_PENALTY: -20,

    // Goat weights
    GOAT_ALIVE: 50,
    TIGERS_BLOCKED_COMPLETELY: 10000,
    DEFENSIVE_FORMATION: 20,
    SAFE_GOAT: 10,
    ISOLATED_GOAT_PENALTY: -30,
    GOAT_MOBILITY: 5,
  };

  /**
   * Evaluate position from a player's perspective
   * Positive score = good for player, Negative = bad for player
   */
  public static evaluate(gameState: GameState, player: PlayerType): number {
    const board = new Board();
    board.fromArray(gameState.board);

    if (player === PlayerType.TIGER) {
      return this.evaluateForTigers(gameState, board);
    } else {
      return this.evaluateForGoats(gameState, board);
    }
  }

  /**
   * Evaluate position for Tigers
   */
  private static evaluateForTigers(gameState: GameState, board: Board): number {
    let score = 0;

    // Goats captured (most important)
    score += gameState.goatsCaptured * this.WEIGHTS.GOAT_CAPTURED;

    // Check for immediate win
    if (gameState.goatsCaptured >= 5) {
      return 100000; // Winning position
    }

    // Tiger mobility (number of valid moves)
    const tigers = board.getPiecesOfType(PieceType.TIGER);
    let totalMobility = 0;
    let blockedTigers = 0;

    tigers.forEach((tigerPos) => {
      const mobility = this.countPieceMobility(board, tigerPos, PlayerType.TIGER);
      totalMobility += mobility;

      if (mobility === 0) {
        blockedTigers++;
      }

      // Penalty for tigers in corners (less mobility)
      if (this.isCorner(tigerPos)) {
        score += this.WEIGHTS.TIGER_CORNER_PENALTY;
      }

      // Bonus for center control
      if (this.isCenterArea(tigerPos)) {
        score += this.WEIGHTS.CENTER_CONTROL;
      }
    });

    score += totalMobility * this.WEIGHTS.TIGER_MOBILITY;
    score += blockedTigers * this.WEIGHTS.TIGER_BLOCKED;

    // Check for complete blockage (losing position)
    if (gameState.phase === GamePhase.MOVEMENT && totalMobility === 0) {
      return -100000; // Losing position
    }

    // Count threatened goats (goats that can be captured next move)
    const threatenedGoats = this.countThreatenedGoats(board);
    score += threatenedGoats * this.WEIGHTS.GOAT_THREATENED;

    return score;
  }

  /**
   * Evaluate position for Goats
   */
  private static evaluateForGoats(gameState: GameState, board: Board): number {
    let score = 0;

    // Goats alive (most important)
    const goatsAlive = 20 - gameState.goatsCaptured;
    score += goatsAlive * this.WEIGHTS.GOAT_ALIVE;

    // Check for immediate loss
    if (gameState.goatsCaptured >= 5) {
      return -100000; // Losing position
    }

    // Check if all tigers are blocked (winning condition)
    if (gameState.phase === GamePhase.MOVEMENT) {
      const tigerMobility = Rules.countValidMoves(
        board,
        PlayerType.TIGER,
        gameState.phase,
        gameState.goatsRemaining
      );

      if (tigerMobility === 0) {
        return 100000; // Winning position
      }

      // Bonus for reducing tiger mobility
      score += (20 - tigerMobility) * 10;
    }

    // Evaluate goat positions
    const goats = board.getPiecesOfType(PieceType.GOAT);
    let isolatedGoats = 0;
    let safeGoats = 0;

    goats.forEach((goatPos) => {
      // Check if goat is isolated (no adjacent friendly goats)
      const adjacentGoats = this.countAdjacentPieces(board, goatPos, PieceType.GOAT);
      if (adjacentGoats === 0) {
        isolatedGoats++;
      } else {
        // Bonus for goats in formation
        score += adjacentGoats * this.WEIGHTS.DEFENSIVE_FORMATION;
      }

      // Check if goat is safe (not threatened by tigers)
      if (!this.isGoatThreatened(board, goatPos)) {
        safeGoats++;
      }

      // Bonus for goats in center area (control center)
      if (this.isCenterArea(goatPos)) {
        score += this.WEIGHTS.CENTER_CONTROL / 2;
      }
    });

    score += isolatedGoats * this.WEIGHTS.ISOLATED_GOAT_PENALTY;
    score += safeGoats * this.WEIGHTS.SAFE_GOAT;

    // Goat mobility (in movement phase)
    if (gameState.phase === GamePhase.MOVEMENT) {
      const goatMobility = Rules.countValidMoves(
        board,
        PlayerType.GOAT,
        gameState.phase,
        gameState.goatsRemaining
      );
      score += goatMobility * this.WEIGHTS.GOAT_MOBILITY;
    }

    return score;
  }

  /**
   * Count how many valid moves a piece has
   */
  private static countPieceMobility(
    board: Board,
    position: Position,
    player: PlayerType
  ): number {
    const neighbors = board.getNeighbors(position);
    let mobility = 0;

    // Count adjacent empty moves
    neighbors.forEach((neighbor) => {
      if (board.isEmpty(neighbor)) {
        mobility++;
      }
    });

    // For tigers, count capture moves
    if (player === PlayerType.TIGER) {
      neighbors.forEach((neighbor) => {
        if (board.getPiece(neighbor) === PieceType.GOAT) {
          const middle = neighbor;
          const rowDiff = middle.row - position.row;
          const colDiff = middle.col - position.col;
          const landing: Position = {
            row: middle.row + rowDiff,
            col: middle.col + colDiff,
          };

          if (board.isValidPosition(landing) && board.isEmpty(landing)) {
            if (board.areAdjacent(middle, landing)) {
              mobility++; // Capture move available
            }
          }
        }
      });
    }

    return mobility;
  }

  /**
   * Count threatened goats (that can be captured by tigers)
   */
  private static countThreatenedGoats(board: Board): number {
    const tigers = board.getPiecesOfType(PieceType.TIGER);
    const threatenedGoats = new Set<string>();

    tigers.forEach((tigerPos) => {
      const neighbors = board.getNeighbors(tigerPos);

      neighbors.forEach((neighbor) => {
        if (board.getPiece(neighbor) === PieceType.GOAT) {
          const rowDiff = neighbor.row - tigerPos.row;
          const colDiff = neighbor.col - tigerPos.col;
          const landing: Position = {
            row: neighbor.row + rowDiff,
            col: neighbor.col + colDiff,
          };

          if (board.isValidPosition(landing) && board.isEmpty(landing)) {
            if (board.areAdjacent(neighbor, landing)) {
              threatenedGoats.add(`${neighbor.row},${neighbor.col}`);
            }
          }
        }
      });
    });

    return threatenedGoats.size;
  }

  /**
   * Check if a goat is threatened by any tiger
   */
  private static isGoatThreatened(board: Board, goatPos: Position): boolean {
    const tigers = board.getPiecesOfType(PieceType.TIGER);

    return tigers.some((tigerPos) => {
      const middle = goatPos;
      const rowDiff = middle.row - tigerPos.row;
      const colDiff = middle.col - tigerPos.col;

      // Check if tiger is adjacent
      if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
        const landing: Position = {
          row: middle.row + rowDiff,
          col: middle.col + colDiff,
        };

        if (board.isValidPosition(landing) && board.isEmpty(landing)) {
          return board.areAdjacent(tigerPos, middle) && board.areAdjacent(middle, landing);
        }
      }

      return false;
    });
  }

  /**
   * Count adjacent pieces of a certain type
   */
  private static countAdjacentPieces(
    board: Board,
    position: Position,
    pieceType: PieceType
  ): number {
    const neighbors = board.getNeighbors(position);
    return neighbors.filter((n) => board.getPiece(n) === pieceType).length;
  }

  /**
   * Check if position is a corner
   */
  private static isCorner(pos: Position): boolean {
    return (
      (pos.row === 0 || pos.row === 4) &&
      (pos.col === 0 || pos.col === 4)
    );
  }

  /**
   * Check if position is in center area (center 3x3)
   */
  private static isCenterArea(pos: Position): boolean {
    return pos.row >= 1 && pos.row <= 3 && pos.col >= 1 && pos.col <= 3;
  }

  /**
   * Quick evaluation (faster, less accurate)
   * Used for move ordering in alpha-beta pruning
   */
  public static quickEvaluate(gameState: GameState, player: PlayerType): number {
    // Simple material count
    let score = 0;

    if (player === PlayerType.TIGER) {
      score = gameState.goatsCaptured * 1000;
      if (gameState.goatsCaptured >= 5) return 100000;
    } else {
      score = (20 - gameState.goatsCaptured) * 50;
      if (gameState.goatsCaptured >= 5) return -100000;
    }

    return score;
  }
}
