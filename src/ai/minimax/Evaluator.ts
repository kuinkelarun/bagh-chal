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
    GOAT_MOBILITY: 12,
    GOAT_THREAT_ANTICIPATION: -20,
    TIGER_ADJACENCY_BLOCK: 15,
    UNSAFE_BLOCKER_PENALTY: -30,
    PLACEMENT_TIGER_ADJACENT_PENALTY: -25,
    EDGE_SAFETY: 8,
    ENCLOSURE_SCALE: 120,
    CAPTURE_ONLY_TIGER: 200,
    SACRIFICE_BAIT: 25,
  };

  // Near-win urgency: tiered score for total tiger mobility (movement phase only)
  // Creates a steep gradient so the AI strongly prefers moves that tighten the trap
  private static tigerMobilityScore(mobility: number): number {
    switch (mobility) {
      case 1: return 1200;
      case 2: return 600;
      case 3: return 300;
      case 4: return 150;
      case 5: return 90;
      default: return (20 - mobility) * 8;
    }
  }

  // Per-tiger confinement bonus for the most-confined individual tiger
  private static mostConfinedTigerBonus(minMobility: number): number {
    if (minMobility <= 0) return 0; // already handled by 100000 check
    if (minMobility === 1) return 800;
    if (minMobility === 2) return 300;
    return 0;
  }

  // Escalating penalty as captured goats approach the loss threshold of 5
  private static readonly CAPTURE_DANGER_SCALE = [0, 0, -20, -60, -150];

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
   * Evaluate position for Goats (phase-aware)
   */
  private static evaluateForGoats(gameState: GameState, board: Board): number {
    let score = 0;
    const isPlacement = gameState.phase === GamePhase.PLACEMENT;

    // --- Material base ---
    const goatsAlive = 20 - gameState.goatsCaptured;
    score += goatsAlive * this.WEIGHTS.GOAT_ALIVE;

    // Immediate loss
    if (gameState.goatsCaptured >= 5) {
      return -100000;
    }

    // Escalating danger as captures approach threshold
    if (gameState.goatsCaptured > 0 && gameState.goatsCaptured < 5) {
      score += this.CAPTURE_DANGER_SCALE[gameState.goatsCaptured];
    }

    // --- Tiger mobility & blocking (movement phase) ---
    const tigers = board.getPiecesOfType(PieceType.TIGER);
    if (!isPlacement) {
      const tigerMobility = Rules.countValidMoves(
        board,
        PlayerType.TIGER,
        gameState.phase,
        gameState.goatsRemaining
      );

      if (tigerMobility === 0) {
        return 100000; // Winning — all tigers blocked
      }

      // Tiered near-win urgency (replaces linear formula)
      score += this.tigerMobilityScore(tigerMobility);

      // Per-tiger confinement: bonus for the most-caged individual tiger
      let minTigerMobility = Infinity;
      let captureOnlyTigers = 0;
      for (const tigerPos of tigers) {
        const { plain, captures } = this.countTigerMoveTypes(board, tigerPos);
        const m = plain + captures;
        if (m < minTigerMobility) minTigerMobility = m;
        if (m > 0 && plain === 0) captureOnlyTigers++; // can only escape by eating
      }
      score += this.mostConfinedTigerBonus(minTigerMobility);
      score += captureOnlyTigers * this.WEIGHTS.CAPTURE_ONLY_TIGER;

      // Goat mobility matters more in movement phase
      const goatMobility = Rules.countValidMoves(
        board,
        PlayerType.GOAT,
        gameState.phase,
        gameState.goatsRemaining
      );
      score += goatMobility * this.WEIGHTS.GOAT_MOBILITY;

      // Enclosure score: tigers surrounded by a high ratio of goats score heavily
      for (const tigerPos of tigers) {
        const neighbors = board.getNeighbors(tigerPos);
        if (neighbors.length === 0) continue;
        const goatNeighbors = neighbors.filter(n => board.getPiece(n) === PieceType.GOAT).length;
        const ratio = goatNeighbors / neighbors.length;
        score += ratio * ratio * this.WEIGHTS.ENCLOSURE_SCALE;
      }
    }

    // --- Per-goat positional evaluation ---
    const goats = board.getPiecesOfType(PieceType.GOAT);
    let isolatedGoats = 0;
    let safeGoats = 0;

    goats.forEach((goatPos) => {
      const adjacentGoats = this.countAdjacentPieces(board, goatPos, PieceType.GOAT);
      const adjacentTigers = this.countAdjacentPieces(board, goatPos, PieceType.TIGER);

      // Formation bonus
      if (adjacentGoats === 0) {
        // In movement phase, a goat alone but next to a tiger is blocking, not isolated
        if (!isPlacement && adjacentTigers > 0) {
          // Not penalised — it's serving a blocking role
        } else {
          isolatedGoats++;
        }
      } else {
        score += adjacentGoats * this.WEIGHTS.DEFENSIVE_FORMATION;
      }

      // Safety check
      if (!this.isGoatThreatened(board, goatPos)) {
        safeGoats++;
      }

      // Center control — full weight during placement, half during movement
      if (this.isCenterArea(goatPos)) {
        score += isPlacement ? this.WEIGHTS.CENTER_CONTROL : this.WEIGHTS.CENTER_CONTROL / 2;
      }

      // Edge safety — edges are harder to capture from (fewer approach vectors)
      if (this.isEdgePosition(goatPos)) {
        score += this.WEIGHTS.EDGE_SAFETY;
      }

      // During placement, avoid dropping goats adjacent to tigers unless corner-protected
      if (isPlacement && adjacentTigers > 0 && !this.isCorner(goatPos)) {
        score += adjacentTigers * this.WEIGHTS.PLACEMENT_TIGER_ADJACENT_PENALTY;
      }
    });

    // Isolation penalty is lighter during placement (still placing goats)
    const isolationPenalty = isPlacement ? -15 : this.WEIGHTS.ISOLATED_GOAT_PENALTY;
    score += isolatedGoats * isolationPenalty;
    score += safeGoats * this.WEIGHTS.SAFE_GOAT;

    // --- Blocking contribution: only safe blockers count positively ---
    const { safe: safeBlockers, unsafe: unsafeBlockers } = this.countBlockingGoats(board, tigers);
    score += safeBlockers * this.WEIGHTS.TIGER_ADJACENCY_BLOCK;
    score += unsafeBlockers * this.WEIGHTS.UNSAFE_BLOCKER_PENALTY;

    // --- Future threat anticipation: goats in danger next turn ---
    const futureThreats = this.countFutureThreats(board, tigers);
    score += futureThreats * this.WEIGHTS.GOAT_THREAT_ANTICIPATION;

    // --- Sacrifice bait signal: capturable goats that worsen tiger confinement ---
    if (!isPlacement) {
      score += this.countSacrificeBaits(board, tigers) * this.WEIGHTS.SACRIFICE_BAIT;
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
          // A tiger cannot jump over a corner position goat
          if (this.isCorner(neighbor)) return;

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
          // A tiger cannot jump over a corner position goat
          if (this.isCorner(neighbor)) return;

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
      // A tiger cannot jump over a corner position goat
      if (this.isCorner(middle)) return false;

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
   * Check if position is on the board edge (but not a corner)
   */
  private static isEdgePosition(pos: Position): boolean {
    if (this.isCorner(pos)) return false;
    return pos.row === 0 || pos.row === 4 || pos.col === 0 || pos.col === 4;
  }

  /**
   * Count goats whose presence actively restricts tiger movement.
   * Returns separate counts for safe blockers (tiger cannot immediately capture)
   * and unsafe blockers (tiger can jump over them right now).
   */
  private static countBlockingGoats(
    board: Board,
    tigers: Position[]
  ): { safe: number; unsafe: number } {
    const safeSet = new Set<string>();
    const unsafeSet = new Set<string>();

    for (const tigerPos of tigers) {
      const neighbors = board.getNeighbors(tigerPos);
      for (const neighbor of neighbors) {
        if (board.getPiece(neighbor) !== PieceType.GOAT) continue;
        if (this.isCorner(neighbor)) continue; // corner goats can't be jumped

        const key = `${neighbor.row},${neighbor.col}`;
        // Check if tiger can capture this goat (landing square is empty)
        const rowDiff = neighbor.row - tigerPos.row;
        const colDiff = neighbor.col - tigerPos.col;
        const landing: Position = {
          row: neighbor.row + rowDiff,
          col: neighbor.col + colDiff,
        };
        const capturable =
          board.isValidPosition(landing) &&
          board.isEmpty(landing) &&
          board.areAdjacent(neighbor, landing);

        if (capturable) {
          if (!safeSet.has(key)) unsafeSet.add(key);
        } else {
          unsafeSet.delete(key);
          safeSet.add(key);
        }
      }
    }

    return { safe: safeSet.size, unsafe: unsafeSet.size };
  }

  /**
   * Count plain moves vs capture moves available to a single tiger.
   */
  private static countTigerMoveTypes(
    board: Board,
    tigerPos: Position
  ): { plain: number; captures: number } {
    const neighbors = board.getNeighbors(tigerPos);
    let plain = 0;
    let captures = 0;

    for (const neighbor of neighbors) {
      if (board.isEmpty(neighbor)) {
        plain++;
      } else if (board.getPiece(neighbor) === PieceType.GOAT && !this.isCorner(neighbor)) {
        const rowDiff = neighbor.row - tigerPos.row;
        const colDiff = neighbor.col - tigerPos.col;
        const landing: Position = {
          row: neighbor.row + rowDiff,
          col: neighbor.col + colDiff,
        };
        if (
          board.isValidPosition(landing) &&
          board.isEmpty(landing) &&
          board.areAdjacent(neighbor, landing)
        ) {
          captures++;
        }
      }
    }

    return { plain, captures };
  }

  /**
   * Count capturable goats whose removal would worsen the capturing tiger's
   * own confinement (i.e., trap-bait / sacrifice positions).
   * Returns the count of such bait goats on the board.
   */
  private static countSacrificeBaits(board: Board, tigers: Position[]): number {
    let baitCount = 0;

    for (const tigerPos of tigers) {
      const { plain: plainBefore, captures } = this.countTigerMoveTypes(board, tigerPos);
      if (captures === 0) continue;

      const neighbors = board.getNeighbors(tigerPos);
      for (const neighbor of neighbors) {
        if (board.getPiece(neighbor) !== PieceType.GOAT) continue;
        if (this.isCorner(neighbor)) continue;

        const rowDiff = neighbor.row - tigerPos.row;
        const colDiff = neighbor.col - tigerPos.col;
        const landing: Position = {
          row: neighbor.row + rowDiff,
          col: neighbor.col + colDiff,
        };

        if (
          !board.isValidPosition(landing) ||
          !board.isEmpty(landing) ||
          !board.areAdjacent(neighbor, landing)
        ) continue;

        // Simulate capture: tiger moves to landing, goat removed
        board.setPiece(tigerPos, PieceType.EMPTY);
        board.setPiece(neighbor, PieceType.EMPTY);
        board.setPiece(landing, PieceType.TIGER);

        const { plain: plainAfter, captures: capturesAfter } =
          this.countTigerMoveTypes(board, landing);
        const mobilityAfter = plainAfter + capturesAfter;
        const mobilityBefore = plainBefore + captures;

        // Undo simulation
        board.setPiece(landing, PieceType.EMPTY);
        board.setPiece(neighbor, PieceType.GOAT);
        board.setPiece(tigerPos, PieceType.TIGER);

        // If capturing this goat leaves tiger MORE confined → it's bait
        if (mobilityAfter < mobilityBefore) {
          baitCount++;
        }
      }
    }

    return baitCount;
  }

  /**
   * Count goats that would become threatened if any tiger makes one adjacent move.
   * Simulates each tiger moving to each empty neighbor and checks for new capture
   * opportunities on the resulting hypothetical board.
   */
  private static countFutureThreats(board: Board, tigers: Position[]): number {
    const currentlyThreatened = new Set<string>();
    const futureThreatened = new Set<string>();

    // Collect currently threatened goats so we only count NEW threats
    const goats = board.getPiecesOfType(PieceType.GOAT);
    for (const g of goats) {
      if (this.isGoatThreatened(board, g)) {
        currentlyThreatened.add(`${g.row},${g.col}`);
      }
    }

    // For each tiger, try each empty adjacent square
    for (const tigerPos of tigers) {
      const neighbors = board.getNeighbors(tigerPos);
      for (const dest of neighbors) {
        if (!board.isEmpty(dest)) continue;

        // Simulate tiger moving: clear old position, place tiger at dest
        const origTiger = board.getPiece(tigerPos);
        board.setPiece(tigerPos, PieceType.EMPTY);
        board.setPiece(dest, PieceType.TIGER);

        // Check which goats become newly threatened from this position
        const destNeighbors = board.getNeighbors(dest);
        for (const n of destNeighbors) {
          if (board.getPiece(n) !== PieceType.GOAT) continue;
          if (this.isCorner(n)) continue; // Corner goats can't be jumped

          const rowDiff = n.row - dest.row;
          const colDiff = n.col - dest.col;
          const landing: Position = { row: n.row + rowDiff, col: n.col + colDiff };

          if (
            board.isValidPosition(landing) &&
            board.isEmpty(landing) &&
            board.areAdjacent(dest, n) &&
            board.areAdjacent(n, landing)
          ) {
            const gKey = `${n.row},${n.col}`;
            if (!currentlyThreatened.has(gKey)) {
              futureThreatened.add(gKey);
            }
          }
        }

        // Undo simulation
        board.setPiece(dest, PieceType.EMPTY);
        board.setPiece(tigerPos, origTiger!);
      }
    }

    return futureThreatened.size;
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
