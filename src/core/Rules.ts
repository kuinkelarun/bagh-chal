/**
 * Rules engine for Bagh Chal
 * Handles move validation, captures, and win conditions
 */

import { Board } from './Board';
import {
  Position,
  Move,
  PieceType,
  PlayerType,
  GamePhase,
  ValidMove,
  GOATS_TO_WIN,
} from './types';

export class Rules {
  /**
   * Get all valid moves for the current player
   */
  public static getValidMoves(
    board: Board,
    player: PlayerType,
    phase: GamePhase,
    goatsRemaining: number
  ): ValidMove[] {
    if (phase === GamePhase.PLACEMENT && player === PlayerType.GOAT) {
      return this.getPlacementMoves(board);
    } else {
      return this.getMovementMoves(board, player);
    }
  }

  /**
   * Get valid placement moves (goat phase)
   * Goats can be placed on any empty point
   */
  private static getPlacementMoves(board: Board): ValidMove[] {
    const emptyPositions = board.getEmptyPositions();
    return emptyPositions.map((pos) => ({
      move: {
        from: null,
        to: pos,
        captured: null,
      },
      isCapture: false,
    }));
  }

  /**
   * Get valid movement moves for a player
   */
  private static getMovementMoves(board: Board, player: PlayerType): ValidMove[] {
    const validMoves: ValidMove[] = [];
    const pieceType = player === PlayerType.TIGER ? PieceType.TIGER : PieceType.GOAT;
    const pieces = board.getPiecesOfType(pieceType);

    for (const from of pieces) {
      // Get adjacent moves
      const adjacentMoves = this.getAdjacentMoves(board, from);
      validMoves.push(...adjacentMoves);

      // Get capture moves (only for tigers)
      if (player === PlayerType.TIGER) {
        const captureMoves = this.getCaptureMoves(board, from);
        validMoves.push(...captureMoves);
      }
    }

    return validMoves;
  }

  /**
   * Get valid adjacent moves (move to neighboring empty point)
   */
  private static getAdjacentMoves(board: Board, from: Position): ValidMove[] {
    const neighbors = board.getNeighbors(from);
    const validMoves: ValidMove[] = [];

    for (const to of neighbors) {
      if (board.isEmpty(to)) {
        validMoves.push({
          move: { from, to, captured: null },
          isCapture: false,
        });
      }
    }

    return validMoves;
  }

  /**
   * Check if a position is a corner
   */
  private static isCornerPosition(pos: Position): boolean {
    return (pos.row === 0 || pos.row === 4) && (pos.col === 0 || pos.col === 4);
  }

  /**
   * Get valid capture moves for a tiger
   * Tiger can jump over a goat to an empty point beyond
   * A tiger cannot jump over a goat at a corner position
   */
  private static getCaptureMoves(board: Board, from: Position): ValidMove[] {
    const validMoves: ValidMove[] = [];
    const neighbors = board.getNeighbors(from);

    for (const neighbor of neighbors) {
      // Check if neighbor is a goat
      if (board.getPiece(neighbor) === PieceType.GOAT) {
        // A tiger cannot jump over a corner position goat
        if (this.isCornerPosition(neighbor)) {
          continue;
        }

        // Calculate landing position (two steps from 'from' in same direction)
        const rowDiff = neighbor.row - from.row;
        const colDiff = neighbor.col - from.col;
        const landing: Position = {
          row: neighbor.row + rowDiff,
          col: neighbor.col + colDiff,
        };

        // Check if landing position is valid and empty
        if (board.isValidPosition(landing) && board.isEmpty(landing)) {
          // Verify the landing position is actually a neighbor of the goat
          // (ensures we follow valid board connections)
          if (board.areAdjacent(neighbor, landing)) {
            validMoves.push({
              move: { from, to: landing, captured: neighbor },
              isCapture: true,
            });
          }
        }
      }
    }

    return validMoves;
  }

  /**
   * Validate if a move is legal
   */
  public static isValidMove(
    board: Board,
    move: Move,
    player: PlayerType,
    phase: GamePhase,
    goatsRemaining: number
  ): boolean {
    const validMoves = this.getValidMoves(board, player, phase, goatsRemaining);
    return validMoves.some((vm) => this.movesEqual(vm.move, move));
  }

  /**
   * Check if two moves are equal
   */
  private static movesEqual(m1: Move, m2: Move): boolean {
    return (
      this.positionsEqual(m1.from, m2.from) &&
      this.positionsEqual(m1.to, m2.to) &&
      this.positionsEqual(m1.captured, m2.captured)
    );
  }

  /**
   * Check if two positions are equal (handles null)
   */
  private static positionsEqual(p1: Position | null, p2: Position | null): boolean {
    if (p1 === null && p2 === null) return true;
    if (p1 === null || p2 === null) return false;
    return p1.row === p2.row && p1.col === p2.col;
  }

  /**
   * Apply a move to the board (mutates board)
   * Returns true if successful, false if invalid
   */
  public static applyMove(board: Board, move: Move, player: PlayerType): boolean {
    const pieceType = player === PlayerType.TIGER ? PieceType.TIGER : PieceType.GOAT;

    // Placement move
    if (move.from === null) {
      if (board.isEmpty(move.to)) {
        board.setPiece(move.to, pieceType);
        return true;
      }
      return false;
    }

    // Movement move
    if (board.getPiece(move.from) === pieceType && board.isEmpty(move.to)) {
      // Move piece
      board.setPiece(move.to, pieceType);
      board.setPiece(move.from, PieceType.EMPTY);

      // Handle capture
      if (move.captured !== null) {
        board.setPiece(move.captured, PieceType.EMPTY);
      }

      return true;
    }

    return false;
  }

  /**
   * Undo a move (mutates board)
   */
  public static undoMove(board: Board, move: Move, player: PlayerType): void {
    const pieceType = player === PlayerType.TIGER ? PieceType.TIGER : PieceType.GOAT;

    // Undo placement
    if (move.from === null) {
      board.setPiece(move.to, PieceType.EMPTY);
      return;
    }

    // Undo movement
    board.setPiece(move.from, pieceType);
    board.setPiece(move.to, PieceType.EMPTY);

    // Restore captured piece
    if (move.captured !== null) {
      board.setPiece(move.captured, PieceType.GOAT);
    }
  }

  /**
   * Check if tigers have won (captured 5 goats)
   */
  public static isTigerWin(goatsCaptured: number): boolean {
    return goatsCaptured >= GOATS_TO_WIN;
  }

  /**
   * Check if goats have won (all tigers blocked)
   */
  public static isGoatWin(board: Board, phase: GamePhase): boolean {
    // Goats can only win in movement phase (all goats must be placed)
    if (phase !== GamePhase.MOVEMENT) {
      return false;
    }

    // Check if all tigers are blocked (no valid moves)
    const tigerMoves = this.getMovementMoves(board, PlayerType.TIGER);
    return tigerMoves.length === 0;
  }

  /**
   * Check if the game is over and determine winner
   * Returns null if game is still in progress, otherwise returns winner
   */
  public static checkGameOver(
    board: Board,
    phase: GamePhase,
    goatsCaptured: number
  ): PlayerType | null {
    // Check tiger win condition
    if (this.isTigerWin(goatsCaptured)) {
      return PlayerType.TIGER;
    }

    // Check goat win condition
    if (this.isGoatWin(board, phase)) {
      return PlayerType.GOAT;
    }

    // Check if tigers win by blocking all goat moves (rare case)
    if (this.isTigerWinByBlocking(board, phase)) {
      return PlayerType.TIGER;
    }

    return null;
  }

  /**
   * Check if tigers win by blocking all goat moves (movement phase only)
   */
  public static isTigerWinByBlocking(board: Board, phase: GamePhase): boolean {
    if (phase !== GamePhase.MOVEMENT) {
      return false;
    }

    const goatMoves = this.getMovementMoves(board, PlayerType.GOAT);
    return goatMoves.length === 0;
  }

  /**
   * Count number of valid moves for a player
   */
  public static countValidMoves(
    board: Board,
    player: PlayerType,
    phase: GamePhase,
    goatsRemaining: number
  ): number {
    return this.getValidMoves(board, player, phase, goatsRemaining).length;
  }

  /**
   * Check if a piece can move (has at least one valid move)
   */
  public static canPieceMove(board: Board, position: Position, player: PlayerType): boolean {
    const piece = board.getPiece(position);
    const expectedPiece = player === PlayerType.TIGER ? PieceType.TIGER : PieceType.GOAT;

    if (piece !== expectedPiece) {
      return false;
    }

    // Check adjacent moves
    const adjacentMoves = this.getAdjacentMoves(board, position);
    if (adjacentMoves.length > 0) {
      return true;
    }

    // Check capture moves (tigers only)
    if (player === PlayerType.TIGER) {
      const captureMoves = this.getCaptureMoves(board, position);
      return captureMoves.length > 0;
    }

    return false;
  }
}
