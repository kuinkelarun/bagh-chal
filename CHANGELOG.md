# Changelog

All notable changes to the Bagh Chal project will be documented in this file.

## [Phase 3] - 2026-04-09

### 🤖 AI Implementation - Smart Opponents Added!

#### Added
- **AI Engine System**
  - `AIEngine` interface for pluggable AI implementations
  - `AIFactory` for easy AI instantiation
  - Configuration presets for 5 difficulty levels (1-4 implemented, 5 planned)

- **Minimax Algorithm** (`src/ai/minimax/MinimaxEngine.ts`)
  - Full minimax implementation with alpha-beta pruning
  - Iterative deepening for time management
  - Transposition table for caching positions
  - Move ordering for better pruning efficiency
  - Configurable search depth per difficulty level
  - Randomness factor for lower difficulties (makes AI less predictable)

- **Position Evaluation** (`src/ai/minimax/Evaluator.ts`)
  - Sophisticated evaluation functions for both Tigers and Goats
  - Tiger strategy: Material (captures), mobility, center control, threats
  - Goat strategy: Survival, tiger blocking, defensive formations, safety
  - Quick evaluation for move ordering
  - Position-specific bonuses (center control, corners, etc.)

- **Opening Book** (`src/ai/minimax/openingBook.ts`)
  - Pre-computed optimal opening moves
  - Separate opening strategies for Tigers and Goats
  - Weighted move selection (probabilistic)
  - Early game optimization (first 6-16 moves)

- **4 Difficulty Levels**
  1. **Easy** (Level 1)
     - Search depth: 2-3 moves
     - 20% random moves for variety
     - Simple material evaluation
     - Perfect for beginners
  
  2. **Medium** (Level 2)
     - Search depth: 4-5 moves
     - 10% random moves
     - Opening book enabled
     - Good challenge for casual players
  
  3. **Hard** (Level 3)
     - Search depth: 6-7 moves
     - 5% random moves
     - Advanced position evaluation
     - Uses opening book and tactical patterns
     - Tough opponent
  
  4. **Expert** (Level 4)
     - Search depth: 8+ moves
     - No randomness (perfect play)
     - Full opening book
     - Comprehensive evaluation
     - Near-perfect gameplay

- **UI Components**
  - `DifficultySelector`: Interactive AI difficulty picker
  - `AIThinking`: Animated thinking indicator
  - Game mode selector (Human vs Human, Human vs AI, AI vs Human)
  - AI player configuration
  - Disabled board interaction during AI thinking

- **Game Modes**
  - **Human vs Human**: Local multiplayer
  - **Human vs AI**: You play as Goats, AI plays Tigers
  - **AI vs Human**: You play as Tigers, AI plays Goats

#### Changed
- Updated `GameContainer` to support AI opponents
- Enhanced game flow to handle AI moves automatically
- Added AI move computation with async/await
- Improved instructions to show AI status
- Updated README with Phase 3 completion

#### Performance
- Transposition table reduces redundant position evaluations
- Alpha-beta pruning cuts ~50-90% of search tree
- Iterative deepening allows progressive search refinement
- Move ordering improves pruning efficiency

### 🎮 Gameplay Experience
- AI responds within 0.5-5 seconds depending on difficulty
- Smooth animations during AI thinking
- Clear visual feedback for AI moves
- Non-blocking UI (though full Web Workers not yet implemented)

---

## [Phase 2] - 2026-04-08

### 🎨 UI & Game Flow Implementation

#### Added
- Beautiful SVG-based board rendering
- Animated game pieces (Tigers with stripes, Goats with horns)
- Interactive gameplay with click/touch support
- Move highlighting for valid moves
- Piece selection with visual feedback
- Game information panel with real-time stats
- Game controls (New Game, Undo)
- Victory modal with celebration
- Responsive layout (mobile-first design)
- Tailwind CSS styling with custom color themes

#### UI Components Created
- `BoardCanvas.tsx`: SVG board with grid and connections
- `Piece.tsx`: Animated tiger and goat pieces
- `GameContainer.tsx`: Main game orchestration
- `GameInfo.tsx`: Game status and statistics
- `GameControls.tsx`: Control buttons

---

## [Phase 1] - 2026-04-08

### 🎯 Core Game Engine

#### Added
- Complete game logic implementation
- Board representation with adjacency map
- Move validation (placement and movement)
- Capture mechanics (tigers jumping over goats)
- Win condition detection
- Game state management
- Undo/redo functionality (undo implemented)
- Type definitions with TypeScript

#### Core Classes
- `Board`: 5×5 grid with connection management
- `Rules`: Move validation and win condition logic
- `Game`: Game state and turn management
- Type system: Comprehensive type definitions

#### Game Rules Implemented
- Two-phase gameplay (Placement → Movement)
- 4 Tigers vs 20 Goats
- Tiger capture by jumping
- Win conditions:
  - Tigers: Capture 5 goats
  - Goats: Block all tigers

---

## Future Releases

### [Phase 4] - Adaptive AI with ML (Planned)
- Neural network integration (TensorFlow.js)
- Player profiling and pattern recognition
- Adaptive strategy adjustment
- ML model training pipeline
- Level 5 difficulty implementation

### [Phase 5] - LLM Integration (Planned)
- Multi-provider LLM support (OpenAI, Anthropic, etc.)
- Move commentary and analysis
- Strategic hints and coaching
- Post-game analysis

### [Phase 6] - Configuration System (Planned)
- User settings management
- AI algorithm selection
- LLM provider configuration
- Admin panel

### [Phase 7] - Polish & Production (Planned)
- Tutorial system
- Multiple game modes (puzzles, tournaments)
- Move analysis and replay
- PWA support with offline mode
- Performance optimization
- Web Workers for AI computation

---

**Current Version**: Phase 3 Complete (43% of total project)

**Next Milestone**: Phase 4 - Adaptive AI with Machine Learning
