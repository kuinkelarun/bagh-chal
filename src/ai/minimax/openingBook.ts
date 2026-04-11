/**
 * Opening book for Bagh Chal
 * Pre-computed optimal opening moves
 */

import { Move, Position, PlayerType, PieceType } from '@/core/types';

/**
 * Opening move entry
 */
interface OpeningMove {
  move: Move;
  comment?: string;
  weight?: number; // Higher weight = more likely to be chosen
}

/**
 * Opening book database
 */
class OpeningBook {
  private tigerOpenings: Map<string, OpeningMove[]>;
  private goatOpenings: Map<string, OpeningMove[]>;

  constructor() {
    this.tigerOpenings = new Map();
    this.goatOpenings = new Map();
    this.initializeOpenings();
  }

  /**
   * Initialize opening book with known good openings
   */
  private initializeOpenings(): void {
    // Tiger opening moves (first few moves)
    // From corner (0,0) - move toward center
    this.addTigerOpening('0,0', [
      { move: { from: { row: 0, col: 0 }, to: { row: 0, col: 1 }, captured: null }, weight: 10 },
      { move: { from: { row: 0, col: 0 }, to: { row: 1, col: 0 }, captured: null }, weight: 10 },
      { move: { from: { row: 0, col: 0 }, to: { row: 1, col: 1 }, captured: null }, weight: 15 },
    ]);

    // From corner (0,4) - move toward center
    this.addTigerOpening('0,4', [
      { move: { from: { row: 0, col: 4 }, to: { row: 0, col: 3 }, captured: null }, weight: 10 },
      { move: { from: { row: 0, col: 4 }, to: { row: 1, col: 4 }, captured: null }, weight: 10 },
      { move: { from: { row: 0, col: 4 }, to: { row: 1, col: 3 }, captured: null }, weight: 15 },
    ]);

    // From corner (4,0) - move toward center
    this.addTigerOpening('4,0', [
      { move: { from: { row: 4, col: 0 }, to: { row: 4, col: 1 }, captured: null }, weight: 10 },
      { move: { from: { row: 4, col: 0 }, to: { row: 3, col: 0 }, captured: null }, weight: 10 },
      { move: { from: { row: 4, col: 0 }, to: { row: 3, col: 1 }, captured: null }, weight: 15 },
    ]);

    // From corner (4,4) - move toward center
    this.addTigerOpening('4,4', [
      { move: { from: { row: 4, col: 4 }, to: { row: 4, col: 3 }, captured: null }, weight: 10 },
      { move: { from: { row: 4, col: 4 }, to: { row: 3, col: 4 }, captured: null }, weight: 10 },
      { move: { from: { row: 4, col: 4 }, to: { row: 3, col: 3 }, captured: null }, weight: 15 },
    ]);

    // Goat opening placements
    // Best opening positions for goats
    this.addGoatOpening('first', [
      { move: { from: null, to: { row: 2, col: 2 }, captured: null }, weight: 20, comment: 'Center control' },
      { move: { from: null, to: { row: 1, col: 2 }, captured: null }, weight: 15, comment: 'Center top' },
      { move: { from: null, to: { row: 2, col: 1 }, captured: null }, weight: 15, comment: 'Center left' },
      { move: { from: null, to: { row: 2, col: 3 }, captured: null }, weight: 15, comment: 'Center right' },
      { move: { from: null, to: { row: 3, col: 2 }, captured: null }, weight: 15, comment: 'Center bottom' },
    ]);

    // Second goat placement (form defensive structure)
    this.addGoatOpening('second', [
      { move: { from: null, to: { row: 1, col: 1 }, captured: null }, weight: 15 },
      { move: { from: null, to: { row: 1, col: 3 }, captured: null }, weight: 15 },
      { move: { from: null, to: { row: 3, col: 1 }, captured: null }, weight: 15 },
      { move: { from: null, to: { row: 3, col: 3 }, captured: null }, weight: 15 },
      { move: { from: null, to: { row: 0, col: 2 }, captured: null }, weight: 10 },
      { move: { from: null, to: { row: 2, col: 0 }, captured: null }, weight: 10 },
    ]);

    // Later goat placements (fill defensive structure)
    this.addGoatOpening('later', [
      { move: { from: null, to: { row: 1, col: 2 }, captured: null }, weight: 10 },
      { move: { from: null, to: { row: 2, col: 1 }, captured: null }, weight: 10 },
      { move: { from: null, to: { row: 2, col: 3 }, captured: null }, weight: 10 },
      { move: { from: null, to: { row: 3, col: 2 }, captured: null }, weight: 10 },
    ]);
  }

  /**
   * Add tiger opening from position
   */
  private addTigerOpening(posKey: string, moves: OpeningMove[]): void {
    this.tigerOpenings.set(posKey, moves);
  }

  /**
   * Add goat opening
   */
  private addGoatOpening(phase: string, moves: OpeningMove[]): void {
    this.goatOpenings.set(phase, moves);
  }

  /**
   * Get opening move for tigers
   */
  public getTigerOpening(tigerPositions: Position[]): Move | null {
    // Try to find opening moves for tigers in corners
    for (const pos of tigerPositions) {
      const key = `${pos.row},${pos.col}`;
      if (this.tigerOpenings.has(key)) {
        const moves = this.tigerOpenings.get(key)!;
        return this.selectWeightedMove(moves);
      }
    }

    return null;
  }

  /**
   * Get opening move for goats
   */
  public getGoatOpening(
    turnNumber: number,
    occupiedPositions: Set<string>,
    boardGrid?: PieceType[][]
  ): Move | null {
    let phase: string;

    if (turnNumber <= 2) {
      phase = 'first';
    } else if (turnNumber <= 8) {
      phase = 'second';
    } else if (turnNumber <= 16) {
      phase = 'later';
    } else {
      return null; // No opening book for late game
    }

    const openings = this.goatOpenings.get(phase);
    if (!openings) return null;

    // Filter out occupied positions and positions threatened by tigers
    const availableMoves = openings.filter((opening) => {
      const posKey = `${opening.move.to.row},${opening.move.to.col}`;
      if (occupiedPositions.has(posKey)) return false;

      // If board grid provided, reject positions where a tiger can immediately capture
      if (boardGrid) {
        const to = opening.move.to;
        if (this.isPositionThreatened(to, boardGrid)) return false;
      }

      return true;
    });

    if (availableMoves.length === 0) return null;

    return this.selectWeightedMove(availableMoves);
  }

  /**
   * Select a move based on weights (probabilistic selection)
   */
  private selectWeightedMove(moves: OpeningMove[]): Move | null {
    if (moves.length === 0) return null;

    const totalWeight = moves.reduce((sum, m) => sum + (m.weight || 1), 0);
    let random = Math.random() * totalWeight;

    for (const opening of moves) {
      random -= opening.weight || 1;
      if (random <= 0) {
        return opening.move;
      }
    }

    // Fallback to first move
    return moves[0].move;
  }

  /**
   * Check if we should use opening book
   */
  public shouldUseOpeningBook(turnNumber: number, player: PlayerType): boolean {
    if (player === PlayerType.TIGER) {
      return turnNumber <= 6; // Use opening book for first 6 moves
    } else {
      return turnNumber <= 16; // Use opening book while placing goats
    }
  }

  /**
   * Lightweight check: would placing a goat at `pos` allow a tiger to
   * immediately capture it on the next move?  Uses raw grid (no Board instance).
   */
  private isPositionThreatened(pos: Position, grid: PieceType[][]): boolean {
    // Directions: horizontal, vertical, and diagonal
    const dirs = [
      [-1, 0], [1, 0], [0, -1], [0, 1],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    for (const [dr, dc] of dirs) {
      const tigerRow = pos.row - dr;
      const tigerCol = pos.col - dc;
      const landingRow = pos.row + dr;
      const landingCol = pos.col + dc;

      // Check bounds
      if (
        tigerRow < 0 || tigerRow > 4 || tigerCol < 0 || tigerCol > 4 ||
        landingRow < 0 || landingRow > 4 || landingCol < 0 || landingCol > 4
      ) continue;

      // Tiger adjacent in this direction, landing square empty
      if (
        grid[tigerRow][tigerCol] === PieceType.TIGER &&
        grid[landingRow][landingCol] === PieceType.EMPTY
      ) {
        // Corner goats can't be jumped over, but this position isn't a corner
        // (opening book never suggests corners), so any tiger+empty-landing = threatened
        return true;
      }
    }

    return false;
  }
}

// Singleton instance
export const openingBook = new OpeningBook();
