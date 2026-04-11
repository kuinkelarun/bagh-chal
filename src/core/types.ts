/**
 * Core type definitions for Bagh Chal game
 */

/**
 * Piece types on the board
 */
export enum PieceType {
  EMPTY = 'empty',
  TIGER = 'tiger',
  GOAT = 'goat',
}

/**
 * Game phases
 */
export enum GamePhase {
  PLACEMENT = 'placement',  // Goats being placed on board
  MOVEMENT = 'movement',    // All goats placed, both sides move
}

/**
 * Player types
 */
export enum PlayerType {
  TIGER = 'tiger',
  GOAT = 'goat',
}

/**
 * Game status
 */
export enum GameStatus {
  IN_PROGRESS = 'in_progress',
  TIGER_WIN = 'tiger_win',
  GOAT_WIN = 'goat_win',
  DRAW = 'draw',
}

/**
 * Position on the board (row, col)
 */
export interface Position {
  row: number;
  col: number;
}

/**
 * A move in the game
 * - from: source position (null for placement moves)
 * - to: destination position
 * - captured: position of captured piece (null if no capture)
 */
export interface Move {
  from: Position | null;
  to: Position;
  captured: Position | null;
}

/**
 * Complete game state
 */
export interface GameState {
  board: PieceType[][];           // 5x5 board state
  phase: GamePhase;               // Current game phase
  currentPlayer: PlayerType;      // Whose turn it is
  goatsRemaining: number;         // Goats left to place (starts at 20)
  goatsCaptured: number;          // Goats captured by tigers
  moveHistory: Move[];            // History of all moves
  status: GameStatus;             // Current game status
  turnNumber: number;             // Current turn number
}

/**
 * Valid move with metadata
 */
export interface ValidMove {
  move: Move;
  isCapture: boolean;
  evaluation?: number;  // Optional evaluation score (for AI)
}

/**
 * Board point with adjacency information
 */
export interface BoardPoint {
  position: Position;
  piece: PieceType;
  neighbors: Position[];  // Adjacent positions
}

/**
 * Game configuration
 */
export interface GameConfig {
  startingPlayer: PlayerType;
  totalGoats: number;
  goatsToCapture: number;  // Tigers win by capturing this many
}

/**
 * Constants for the game
 */
export const BOARD_SIZE = 5;
export const TOTAL_GOATS = 20;
export const GOATS_TO_WIN = 5;  // Tigers win by capturing 5 goats
export const STARTING_TIGERS = 4;

/**
 * Default game configuration
 */
export const DEFAULT_CONFIG: GameConfig = {
  startingPlayer: PlayerType.GOAT,
  totalGoats: TOTAL_GOATS,
  goatsToCapture: GOATS_TO_WIN,
};
