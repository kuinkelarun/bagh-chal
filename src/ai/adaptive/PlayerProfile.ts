/**
 * Player Profile - Analyzes player behavior and patterns
 * Used by Adaptive AI to exploit player weaknesses
 */

import { GameStatisticsTracker } from '@/utils/gameStatistics';
import { Position, Move, PlayerType } from '@/core/types';
import { MoveQuality } from '@/utils/moveAnalysis';

export interface PlayerPattern {
  openingPreferences: string[]; // Preferred opening positions
  playStyle: 'aggressive' | 'defensive' | 'balanced';
  commonMistakes: MoveQuality[];
  averageThinkingTime: number;
  captureRate: number; // For tigers
  survivalRate: number; // For goats
  centerControl: number; // 0-1, how often they control center
  cornerAvoidance: number; // 0-1, how often tigers avoid corners
  isolationTendency: number; // 0-1, how often goats leave pieces isolated
}

export interface StrategicWeakness {
  type: 'opening' | 'midgame' | 'endgame';
  description: string;
  exploitStrategy: string;
  confidence: number; // 0-1
}

export class PlayerProfile {
  private pattern: PlayerPattern;
  private weaknesses: StrategicWeakness[];

  constructor() {
    this.pattern = this.initializePattern();
    this.weaknesses = [];
    this.analyzePlayer();
  }

  /**
   * Initialize default pattern
   */
  private initializePattern(): PlayerPattern {
    return {
      openingPreferences: [],
      playStyle: 'balanced',
      commonMistakes: [],
      averageThinkingTime: 0,
      captureRate: 0,
      survivalRate: 0,
      centerControl: 0.5,
      cornerAvoidance: 0.5,
      isolationTendency: 0.5,
    };
  }

  /**
   * Analyze player based on game history
   */
  private analyzePlayer(): void {
    const stats = GameStatisticsTracker.getPlayerStatistics();
    const tendencies = GameStatisticsTracker.analyzePlayerTendencies();
    const history = GameStatisticsTracker.getGameHistory().slice(0, 20); // Last 20 games

    if (history.length === 0) {
      // No data yet, use defaults
      return;
    }

    // Get opening preferences
    this.pattern.openingPreferences = tendencies.preferredOpenings;

    // Determine play style
    this.pattern.playStyle = tendencies.playStyle;

    // Common mistakes
    this.pattern.commonMistakes = tendencies.commonWeaknesses;

    // Average thinking time
    this.pattern.averageThinkingTime = tendencies.averageThinkingTime;

    // Analyze game-specific patterns
    let totalCenterControl = 0;
    let totalCornerAvoidance = 0;
    let totalIsolation = 0;
    let gamesAnalyzed = 0;

    history.forEach((game) => {
      gamesAnalyzed++;

      // Analyze center control (moves to center 3x3)
      const centerMoves = game.moves.filter((m) => {
        const pos = m.move.to;
        return pos.row >= 1 && pos.row <= 3 && pos.col >= 1 && pos.col <= 3;
      }).length;
      totalCenterControl += centerMoves / game.totalMoves;

      // Analyze corner avoidance (for tigers)
      if (game.humanSide === PlayerType.TIGER) {
        const cornerMoves = game.moves.filter((m) => {
          if (m.player !== PlayerType.TIGER || !m.move.from) return false;
          const pos = m.move.from;
          return (
            (pos.row === 0 || pos.row === 4) &&
            (pos.col === 0 || pos.col === 4)
          );
        }).length;
        totalCornerAvoidance += 1 - cornerMoves / Math.max(game.totalMoves, 1);
      }

      // Analyze isolation tendency (for goats)
      if (game.humanSide === PlayerType.GOAT) {
        // Count isolated goat placements (no adjacent goats)
        let isolatedPlacements = 0;
        let placementMoves = 0;

        game.moves.forEach((m) => {
          if (m.player === PlayerType.GOAT && !m.move.from) {
            placementMoves++;
            // This is a simplified check - in real analysis, we'd check the board state
            isolatedPlacements++;
          }
        });

        if (placementMoves > 0) {
          totalIsolation += isolatedPlacements / placementMoves;
        }
      }
    });

    if (gamesAnalyzed > 0) {
      this.pattern.centerControl = totalCenterControl / gamesAnalyzed;
      this.pattern.cornerAvoidance = totalCornerAvoidance / gamesAnalyzed;
      this.pattern.isolationTendency = totalIsolation / gamesAnalyzed;
    }

    // Calculate capture/survival rates
    const tigerGames = history.filter((g) => g.humanSide === PlayerType.TIGER);
    const goatGames = history.filter((g) => g.humanSide === PlayerType.GOAT);

    if (tigerGames.length > 0) {
      const avgCaptures = tigerGames.reduce((sum, g) => sum + g.goatsCaptured, 0) / tigerGames.length;
      this.pattern.captureRate = avgCaptures / 5; // Normalize to 0-1
    }

    if (goatGames.length > 0) {
      const avgSurvival = goatGames.reduce((sum, g) => sum + (20 - g.goatsCaptured), 0) / goatGames.length;
      this.pattern.survivalRate = avgSurvival / 20; // Normalize to 0-1
    }

    // Identify weaknesses
    this.identifyWeaknesses();
  }

  /**
   * Identify strategic weaknesses to exploit
   */
  private identifyWeaknesses(): void {
    this.weaknesses = [];

    // Opening weaknesses
    if (this.pattern.openingPreferences.length > 0) {
      // Check if player has predictable openings
      this.weaknesses.push({
        type: 'opening',
        description: 'Predictable opening patterns',
        exploitStrategy: 'Prepare counter-strategies for common openings',
        confidence: 0.7,
      });
    }

    // Midgame weaknesses
    if (this.pattern.commonMistakes.includes(MoveQuality.MISTAKE) ||
        this.pattern.commonMistakes.includes(MoveQuality.BLUNDER)) {
      this.weaknesses.push({
        type: 'midgame',
        description: 'Frequent tactical mistakes',
        exploitStrategy: 'Create complex tactical positions to induce errors',
        confidence: 0.8,
      });
    }

    // Isolation tendency (goats)
    if (this.pattern.isolationTendency > 0.6) {
      this.weaknesses.push({
        type: 'opening',
        description: 'Tendency to place isolated goats',
        exploitStrategy: 'Target isolated pieces for early captures',
        confidence: 0.75,
      });
    }

    // Poor center control
    if (this.pattern.centerControl < 0.4) {
      this.weaknesses.push({
        type: 'midgame',
        description: 'Weak center control',
        exploitStrategy: 'Dominate center to restrict movement',
        confidence: 0.7,
      });
    }

    // Corner-heavy play (tigers)
    if (this.pattern.cornerAvoidance < 0.3) {
      this.weaknesses.push({
        type: 'midgame',
        description: 'Gets trapped in corners frequently',
        exploitStrategy: 'Force tigers into corners and block escape',
        confidence: 0.8,
      });
    }

    // Low survival rate (goats)
    if (this.pattern.survivalRate < 0.6) {
      this.weaknesses.push({
        type: 'endgame',
        description: 'Poor goat preservation',
        exploitStrategy: 'Pressure aggressively, player struggles to defend',
        confidence: 0.75,
      });
    }
  }

  /**
   * Get player pattern
   */
  public getPattern(): PlayerPattern {
    return { ...this.pattern };
  }

  /**
   * Get identified weaknesses
   */
  public getWeaknesses(): StrategicWeakness[] {
    return [...this.weaknesses];
  }

  /**
   * Predict player's likely moves for a position
   */
  public predictLikelyMoves(validMoves: Move[]): Move[] {
    // Sort moves by likelihood based on player patterns
    const scoredMoves = validMoves.map((move) => {
      let score = 0.5; // Default score

      // Favor center moves if player prefers center
      if (move.to.row >= 1 && move.to.row <= 3 && move.to.col >= 1 && move.to.col <= 3) {
        score += this.pattern.centerControl * 0.3;
      }

      // Favor/avoid corner moves based on pattern
      if ((move.to.row === 0 || move.to.row === 4) && (move.to.col === 0 || move.to.col === 4)) {
        score -= (1 - this.pattern.cornerAvoidance) * 0.2;
      }

      // Favor captures if player is aggressive
      if (move.captured && this.pattern.playStyle === 'aggressive') {
        score += 0.4;
      }

      return { move, score };
    });

    // Sort by score descending
    scoredMoves.sort((a, b) => b.score - a.score);

    // Return top moves
    return scoredMoves.map((sm) => sm.move);
  }

  /**
   * Suggest adaptation strategy
   */
  public suggestAdaptation(): string {
    if (this.weaknesses.length === 0) {
      return 'Player shows balanced play. Use standard optimal strategy.';
    }

    const topWeakness = this.weaknesses.sort((a, b) => b.confidence - a.confidence)[0];
    return `${topWeakness.description}. ${topWeakness.exploitStrategy}`;
  }

  /**
   * Update profile with new game data
   */
  public update(): void {
    this.analyzePlayer();
  }
}
