/**
 * Game state management for Bagh Chal
 * Handles turns, move history, undo/redo
 */

import { Board } from './Board';
import { Rules } from './Rules';
import {
  GameState,
  GamePhase,
  PlayerType,
  GameStatus,
  Move,
  Position,
  ValidMove,
  DEFAULT_CONFIG,
  GameConfig,
  TOTAL_GOATS,
} from './types';

export class Game {
  private board: Board;
  private phase: GamePhase;
  private currentPlayer: PlayerType;
  private goatsRemaining: number;
  private goatsCaptured: number;
  private moveHistory: Move[];
  private status: GameStatus;
  private turnNumber: number;
  private config: GameConfig;

  // Repetition / stuck-game tracking
  private positionCounts: Map<string, number> = new Map();
  private movesSinceProgress: number = 0;

  constructor(config: GameConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.board = new Board();
    this.phase = GamePhase.PLACEMENT;
    this.currentPlayer = config.startingPlayer;
    this.goatsRemaining = config.totalGoats;
    this.goatsCaptured = 0;
    this.moveHistory = [];
    this.status = GameStatus.IN_PROGRESS;
    this.turnNumber = 0;
    this.positionCounts = new Map();
    this.movesSinceProgress = 0;

    // Initialize board with tigers in corners
    this.board.initializeBoard();

    // Record the initial position
    this.recordPosition();
  }

  /**
   * Make a move
   * Returns true if move was successful, false otherwise
   */
  public makeMove(move: Move): boolean {
    // Validate move
    if (!this.isValidMove(move)) {
      console.error('Invalid move:', move);
      return false;
    }

    // Apply move to board
    if (!Rules.applyMove(this.board, move, this.currentPlayer)) {
      console.error('Failed to apply move:', move);
      return false;
    }

    // Update game state
    this.moveHistory.push(move);
    this.turnNumber++;

    // Handle captures
    if (move.captured !== null) {
      this.goatsCaptured++;
    }

    // Handle placement phase transition
    if (this.phase === GamePhase.PLACEMENT && move.from === null) {
      this.goatsRemaining--;
      if (this.goatsRemaining === 0) {
        this.phase = GamePhase.MOVEMENT;
      }
    }

    // Track progress (captures and placements reset the counter)
    if (move.captured !== null || move.from === null) {
      this.movesSinceProgress = 0;
    } else {
      this.movesSinceProgress++;
    }

    // Check for game over
    this.updateGameStatus();

    // Switch players if game is still in progress
    if (this.status === GameStatus.IN_PROGRESS) {
      this.switchPlayer();
    }

    // Record position after player switch (board + whose turn + phase)
    this.recordPosition();

    return true;
  }

  /**
   * Undo the last move
   * Returns true if successful, false if no moves to undo
   */
  public undoMove(): boolean {
    if (this.moveHistory.length === 0) {
      return false;
    }

    // Decrement position count for current state before we undo
    this.decrementPosition();

    const lastMove = this.moveHistory.pop()!;

    // Determine which player made the last move
    const lastPlayer =
      this.currentPlayer === PlayerType.TIGER ? PlayerType.GOAT : PlayerType.TIGER;

    // Undo move on board
    Rules.undoMove(this.board, lastMove, lastPlayer);

    // Restore game state
    this.turnNumber--;

    // Restore captures
    if (lastMove.captured !== null) {
      this.goatsCaptured--;
    }

    // Restore placement phase if needed
    if (lastMove.from === null) {
      this.goatsRemaining++;
      if (this.goatsRemaining > 0 && this.phase === GamePhase.MOVEMENT) {
        this.phase = GamePhase.PLACEMENT;
      }
    }

    // Switch back to previous player
    this.currentPlayer = lastPlayer;

    // Reset game status
    this.status = GameStatus.IN_PROGRESS;

    // Recalculate movesSinceProgress from remaining history
    this.movesSinceProgress = 0;
    for (let i = this.moveHistory.length - 1; i >= 0; i--) {
      const m = this.moveHistory[i];
      if (m.captured !== null || m.from === null) break;
      this.movesSinceProgress++;
    }

    return true;
  }

  /**
   * Redo a move (not implemented yet, requires separate redo stack)
   */
  public redoMove(): boolean {
    // TODO: Implement redo functionality
    return false;
  }

  /**
   * Check if a move is valid
   */
  public isValidMove(move: Move): boolean {
    return Rules.isValidMove(
      this.board,
      move,
      this.currentPlayer,
      this.phase,
      this.goatsRemaining
    );
  }

  /**
   * Get all valid moves for the current player
   */
  public getValidMoves(): ValidMove[] {
    return Rules.getValidMoves(
      this.board,
      this.currentPlayer,
      this.phase,
      this.goatsRemaining
    );
  }

  /**
   * Get valid moves from a specific position
   */
  public getValidMovesFrom(position: Position): ValidMove[] {
    const allMoves = this.getValidMoves();
    return allMoves.filter(
      (vm) =>
        vm.move.from !== null &&
        vm.move.from.row === position.row &&
        vm.move.from.col === position.col
    );
  }

  /**
   * Switch to the other player
   */
  private switchPlayer(): void {
    // In placement phase, tiger and goat take turns
    // In movement phase, both players move
    if (this.phase === GamePhase.PLACEMENT) {
      // During placement, goat places first, then tiger moves
      this.currentPlayer =
        this.currentPlayer === PlayerType.GOAT ? PlayerType.TIGER : PlayerType.GOAT;
    } else {
      // During movement, players alternate
      this.currentPlayer =
        this.currentPlayer === PlayerType.TIGER ? PlayerType.GOAT : PlayerType.TIGER;
    }
  }

  /**
   * Update game status (check for win conditions)
   */
  private updateGameStatus(): void {
    const winner = Rules.checkGameOver(this.board, this.phase, this.goatsCaptured);

    if (winner === PlayerType.TIGER) {
      this.status = GameStatus.TIGER_WIN;
    } else if (winner === PlayerType.GOAT) {
      this.status = GameStatus.GOAT_WIN;
    } else {
      this.status = GameStatus.IN_PROGRESS;
    }
  }

  /**
   * Reset the game to initial state
   */
  public reset(): void {
    this.board = new Board();
    this.board.initializeBoard();
    this.phase = GamePhase.PLACEMENT;
    this.currentPlayer = this.config.startingPlayer;
    this.goatsRemaining = this.config.totalGoats;
    this.goatsCaptured = 0;
    this.moveHistory = [];
    this.status = GameStatus.IN_PROGRESS;
    this.turnNumber = 0;
    this.positionCounts = new Map();
    this.movesSinceProgress = 0;

    // Record the initial position
    this.recordPosition();
  }

  /**
   * Get current game state (immutable snapshot)
   */
  public getState(): GameState {
    return {
      board: this.board.toArray(),
      phase: this.phase,
      currentPlayer: this.currentPlayer,
      goatsRemaining: this.goatsRemaining,
      goatsCaptured: this.goatsCaptured,
      moveHistory: [...this.moveHistory],
      status: this.status,
      turnNumber: this.turnNumber,
    };
  }

  /**
   * Load game from state
   */
  public loadState(state: GameState): void {
    this.board.fromArray(state.board);
    this.phase = state.phase;
    this.currentPlayer = state.currentPlayer;
    this.goatsRemaining = state.goatsRemaining;
    this.goatsCaptured = state.goatsCaptured;
    this.moveHistory = [...state.moveHistory];
    this.status = state.status;
    this.turnNumber = state.turnNumber;

    // Reset repetition tracking on state load
    this.positionCounts = new Map();
    this.movesSinceProgress = 0;
    this.recordPosition();
  }

  /**
   * Get board instance (for AI or rendering)
   */
  public getBoard(): Board {
    return this.board;
  }

  /**
   * Get current phase
   */
  public getPhase(): GamePhase {
    return this.phase;
  }

  /**
   * Get current player
   */
  public getCurrentPlayer(): PlayerType {
    return this.currentPlayer;
  }

  /**
   * Get game status
   */
  public getStatus(): GameStatus {
    return this.status;
  }

  /**
   * Get goats remaining to place
   */
  public getGoatsRemaining(): number {
    return this.goatsRemaining;
  }

  /**
   * Get goats captured by tigers
   */
  public getGoatsCaptured(): number {
    return this.goatsCaptured;
  }

  /**
   * Get move history
   */
  public getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Get turn number
   */
  public getTurnNumber(): number {
    return this.turnNumber;
  }

  /**
   * Check if game is over
   */
  public isGameOver(): boolean {
    return this.status !== GameStatus.IN_PROGRESS;
  }

  /**
   * Get winner (null if game not over)
   */
  public getWinner(): PlayerType | null {
    if (this.status === GameStatus.TIGER_WIN) return PlayerType.TIGER;
    if (this.status === GameStatus.GOAT_WIN) return PlayerType.GOAT;
    return null;
  }

  // ── Repetition / stuck-game detection ──────────────────────────────

  /** Build a compact key representing the current position + turn + phase. */
  private buildPositionKey(): string {
    return `${this.board.toKey()}|${this.currentPlayer}|${this.phase}`;
  }

  /** Record the current position in the repetition map. */
  private recordPosition(): void {
    const key = this.buildPositionKey();
    this.positionCounts.set(key, (this.positionCounts.get(key) || 0) + 1);
  }

  /** Decrement the current position count (used before undoing a move). */
  private decrementPosition(): void {
    const key = this.buildPositionKey();
    const count = this.positionCounts.get(key) || 0;
    if (count <= 1) {
      this.positionCounts.delete(key);
    } else {
      this.positionCounts.set(key, count - 1);
    }
  }

  /** How many times the current board+turn+phase has been seen. */
  public getRepetitionCount(): number {
    const key = this.buildPositionKey();
    return this.positionCounts.get(key) || 0;
  }

  /** How many consecutive moves have passed without a capture or placement. */
  public getMovesSinceProgress(): number {
    return this.movesSinceProgress;
  }

  /** Declare the game as a draw (called from UI after user accepts). */
  public declareDraw(): void {
    this.status = GameStatus.DRAW;
  }

  // ── Cloning ────────────────────────────────────────────────────────

  /**
   * Clone the game (for AI simulations)
   */
  public clone(): Game {
    const clonedGame = new Game(this.config);
    clonedGame.loadState(this.getState());
    return clonedGame;
  }

  /**
   * Print game state (for debugging)
   */
  public print(): void {
    console.log('\n=== Bagh Chal Game ===');
    console.log(`Phase: ${this.phase}`);
    console.log(`Current Player: ${this.currentPlayer}`);
    console.log(`Goats Remaining: ${this.goatsRemaining}`);
    console.log(`Goats Captured: ${this.goatsCaptured}`);
    console.log(`Turn: ${this.turnNumber}`);
    console.log(`Status: ${this.status}`);
    this.board.print();
  }
}
