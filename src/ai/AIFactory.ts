/**
 * AI Factory
 * Creates AI engines based on configuration
 */

import { AIEngine, AIConfig, AI_PRESETS } from './AIEngine';
import { MinimaxEngine } from './minimax/MinimaxEngine';
import { AdaptiveEngine } from './adaptive/AdaptiveEngine';

export class AIFactory {
  /**
   * Create an AI engine based on difficulty level (1-5)
   */
  public static createFromLevel(level: number): AIEngine {
    const config = AI_PRESETS[level] || AI_PRESETS[2]; // Default to medium
    return this.create(config);
  }

  /**
   * Create an AI engine from configuration
   */
  public static create(config: AIConfig): AIEngine {
    switch (config.algorithm) {
      case 'minimax':
        return new MinimaxEngine(config);

      case 'mcts':
        // TODO: Implement MCTS engine
        console.warn('MCTS not implemented yet, using Minimax');
        return new MinimaxEngine({ ...config, algorithm: 'minimax' });

      case 'neural':
        // TODO: Implement Neural Network engine
        console.warn('Neural Network not implemented yet, using Minimax');
        return new MinimaxEngine({ ...config, algorithm: 'minimax' });

      case 'adaptive':
        // Adaptive AI with player profiling
        return new AdaptiveEngine(config);

      default:
        return new MinimaxEngine(config);
    }
  }

  /**
   * Get difficulty name
   */
  public static getDifficultyName(level: number): string {
    const names: Record<number, string> = {
      1: 'Easy',
      2: 'Medium',
      3: 'Hard',
      4: 'Expert',
      5: 'Adaptive',
    };
    return names[level] || 'Unknown';
  }

  /**
   * Get difficulty description
   */
  public static getDifficultyDescription(level: number): string {
    const descriptions: Record<number, string> = {
      1: 'Perfect for beginners. AI makes simple moves with some randomness.',
      2: 'Good challenge for casual players. AI thinks ahead 4 moves.',
      3: 'Tough opponent. AI uses advanced tactics and opening book.',
      4: 'Expert level. Deep search and perfect opening play.',
      5: 'Adaptive AI that learns your playing style and exploits weaknesses.',
    };
    return descriptions[level] || '';
  }
}
