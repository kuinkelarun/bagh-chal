/**
 * Board representation for Bagh Chal
 * Manages 5x5 grid and adjacency connections
 */

import { Position, PieceType, BOARD_SIZE, PlayerType, STARTING_TIGERS } from './types';

export class Board {
  private grid: PieceType[][];
  private adjacencyMap: Map<string, Position[]>;

  constructor() {
    this.grid = this.createEmptyGrid();
    this.adjacencyMap = this.buildAdjacencyMap();
  }

  /**
   * Create an empty 5x5 grid
   */
  private createEmptyGrid(): PieceType[][] {
    return Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(PieceType.EMPTY));
  }

  /**
   * Initialize board with tigers in corners
   */
  public initializeBoard(): void {
    this.grid = this.createEmptyGrid();
    // Place tigers in four corners
    this.setPiece({ row: 0, col: 0 }, PieceType.TIGER);
    this.setPiece({ row: 0, col: 4 }, PieceType.TIGER);
    this.setPiece({ row: 4, col: 0 }, PieceType.TIGER);
    this.setPiece({ row: 4, col: 4 }, PieceType.TIGER);
  }

  /**
   * Build adjacency map for all positions
   * Each position knows its valid neighbors (connected by lines)
   */
  private buildAdjacencyMap(): Map<string, Position[]> {
    const map = new Map<string, Position[]>();

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const pos = { row, col };
        const neighbors: Position[] = [];

        // Horizontal connections (all rows)
        if (col > 0) neighbors.push({ row, col: col - 1 });
        if (col < BOARD_SIZE - 1) neighbors.push({ row, col: col + 1 });

        // Vertical connections (all columns)
        if (row > 0) neighbors.push({ row: row - 1, col });
        if (row < BOARD_SIZE - 1) neighbors.push({ row: row + 1, col });

        // Diagonal connections (BOTH endpoints must have diagonal capability)
        if (this.hasDiagonalConnections(pos)) {
          // Top-left diagonal
          if (row > 0 && col > 0) {
            const target = { row: row - 1, col: col - 1 };
            if (this.hasDiagonalConnections(target)) {
              neighbors.push(target);
            }
          }
          // Top-right diagonal
          if (row > 0 && col < BOARD_SIZE - 1) {
            const target = { row: row - 1, col: col + 1 };
            if (this.hasDiagonalConnections(target)) {
              neighbors.push(target);
            }
          }
          // Bottom-left diagonal
          if (row < BOARD_SIZE - 1 && col > 0) {
            const target = { row: row + 1, col: col - 1 };
            if (this.hasDiagonalConnections(target)) {
              neighbors.push(target);
            }
          }
          // Bottom-right diagonal
          if (row < BOARD_SIZE - 1 && col < BOARD_SIZE - 1) {
            const target = { row: row + 1, col: col + 1 };
            if (this.hasDiagonalConnections(target)) {
              neighbors.push(target);
            }
          }
        }

        map.set(this.positionKey(pos), neighbors);
      }
    }

    return map;
  }

  /**
   * Check if a position has diagonal connections
   * All positions on the board have diagonal connections
   * (the board has diagonal lines in every cell)
   */
  private hasDiagonalConnections(_pos: Position): boolean {
    return true;
  }

  /**
   * Get neighbors of a position
   */
  public getNeighbors(pos: Position): Position[] {
    return this.adjacencyMap.get(this.positionKey(pos)) || [];
  }

  /**
   * Get piece at position
   */
  public getPiece(pos: Position): PieceType {
    if (!this.isValidPosition(pos)) {
      return PieceType.EMPTY;
    }
    return this.grid[pos.row][pos.col];
  }

  /**
   * Set piece at position
   */
  public setPiece(pos: Position, piece: PieceType): void {
    if (this.isValidPosition(pos)) {
      this.grid[pos.row][pos.col] = piece;
    }
  }

  /**
   * Check if position is valid (within bounds)
   */
  public isValidPosition(pos: Position): boolean {
    return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
  }

  /**
   * Check if position is empty
   */
  public isEmpty(pos: Position): boolean {
    return this.getPiece(pos) === PieceType.EMPTY;
  }

  /**
   * Check if two positions are adjacent (directly connected)
   */
  public areAdjacent(pos1: Position, pos2: Position): boolean {
    const neighbors = this.getNeighbors(pos1);
    return neighbors.some((n) => n.row === pos2.row && n.col === pos2.col);
  }

  /**
   * Get position between two points (for capture logic)
   * Returns middle position if pos2 is two steps away from pos1 in a straight line
   */
  public getMiddlePosition(pos1: Position, pos2: Position): Position | null {
    const rowDiff = pos2.row - pos1.row;
    const colDiff = pos2.col - pos1.col;

    // Check if it's exactly 2 steps away in a valid direction
    if (Math.abs(rowDiff) === 2 && colDiff === 0) {
      // Vertical jump
      return { row: pos1.row + rowDiff / 2, col: pos1.col };
    } else if (Math.abs(colDiff) === 2 && rowDiff === 0) {
      // Horizontal jump
      return { row: pos1.row, col: pos1.col + colDiff / 2 };
    } else if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
      // Diagonal jump
      return { row: pos1.row + rowDiff / 2, col: pos1.col + colDiff / 2 };
    }

    return null;
  }

  /**
   * Get all pieces of a certain type
   */
  public getPiecesOfType(type: PieceType): Position[] {
    const pieces: Position[] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (this.grid[row][col] === type) {
          pieces.push({ row, col });
        }
      }
    }
    return pieces;
  }

  /**
   * Count pieces of a certain type
   */
  public countPieces(type: PieceType): number {
    return this.getPiecesOfType(type).length;
  }

  /**
   * Clone the board
   */
  public clone(): Board {
    const newBoard = new Board();
    newBoard.grid = this.grid.map((row) => [...row]);
    return newBoard;
  }

  /**
   * Get board as 2D array (for serialization)
   */
  public toArray(): PieceType[][] {
    return this.grid.map((row) => [...row]);
  }

  /**
   * Load board from 2D array
   */
  public fromArray(grid: PieceType[][]): void {
    if (grid.length === BOARD_SIZE && grid[0].length === BOARD_SIZE) {
      this.grid = grid.map((row) => [...row]);
    }
  }

  /**
   * Convert position to string key for Map
   */
  private positionKey(pos: Position): string {
    return `${pos.row},${pos.col}`;
  }

  /**
   * Print board to console (for debugging)
   */
  public print(): void {
    console.log('\n  0 1 2 3 4');
    for (let row = 0; row < BOARD_SIZE; row++) {
      let line = `${row} `;
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = this.grid[row][col];
        if (piece === PieceType.TIGER) line += 'T ';
        else if (piece === PieceType.GOAT) line += 'G ';
        else line += '. ';
      }
      console.log(line);
    }
    console.log('');
  }

  /**
   * Get all empty positions
   */
  public getEmptyPositions(): Position[] {
    return this.getPiecesOfType(PieceType.EMPTY);
  }
}
