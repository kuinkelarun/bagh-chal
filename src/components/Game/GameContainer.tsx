import React, { useState, useEffect } from 'react';
import { Game } from '@/core/Game';
import { Position, GamePhase, PieceType, GameStatus, PlayerType, Move } from '@/core/types';
import { AIEngine } from '@/ai/AIEngine';
import { AIFactory } from '@/ai/AIFactory';
import BoardCanvas from '../Board/BoardCanvas';
import FullscreenBoard from '../Board/FullscreenBoard';
import GameInfo from './GameInfo';
import GameControls from './GameControls';
import MoveHistory from './MoveHistory';
import DifficultySelector from '../AI/DifficultySelector';
import AIThinking from '../AI/AIThinking';
import MoveAnalysis from '../AI/MoveAnalysis';
import GameStatistics from './GameStatistics';
import RulesModal from '../Tutorial/RulesModal';
import WelcomeModal from '../Tutorial/WelcomeModal';
import DiagonalTest from '../Debug/DiagonalTest';
import { GameStatisticsTracker, GameRecord, MoveRecord } from '@/utils/gameStatistics';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

type GameMode = 'human-vs-human' | 'human-vs-ai' | 'ai-vs-human';

const GameContainer: React.FC = () => {
  const [game] = useState(() => new Game());
  const [gameState, setGameState] = useState(game.getState());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [highlightedPositions, setHighlightedPositions] = useState<Position[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);

  // AI state
  const [gameMode, setGameMode] = useState<GameMode>('human-vs-ai');
  const [aiDifficulty, setAiDifficulty] = useState<number>(2); // Default to Medium
  const [aiEngine, setAiEngine] = useState<AIEngine | null>(null);
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Game tracking
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [moveRecords, setMoveRecords] = useState<MoveRecord[]>([]);

  // UI state
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('baghchal_has_visited');
    return !hasVisited;
  });
  const [showDiagonalTest, setShowDiagonalTest] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize AI engine
  useEffect(() => {
    const engine = AIFactory.createFromLevel(aiDifficulty);
    setAiEngine(engine);
  }, [aiDifficulty]);

  // Mark as visited when welcome modal closes
  const handleWelcomeClose = () => {
    localStorage.setItem('baghchal_has_visited', 'true');
    setIsWelcomeModalOpen(false);
  };

  const handleWelcomeShowRules = () => {
    setIsRulesModalOpen(true);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUndo: () => {
      if (gameState.moveHistory.length > 0 && !isAIThinking && !isCurrentPlayerAI()) {
        handleUndo();
      }
    },
    onNewGame: () => {
      if (gameState.status !== GameStatus.IN_PROGRESS) {
        handleNewGame();
      }
    },
    onShowRules: () => {
      setIsRulesModalOpen(true);
    },
    onToggleFullscreen: () => {
      setIsFullscreen(!isFullscreen);
    },
    onEscape: () => {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else if (isRulesModalOpen) {
        setIsRulesModalOpen(false);
      } else if (isWelcomeModalOpen) {
        handleWelcomeClose();
      }
    },
  });

  // Update game state
  const updateGameState = () => {
    setGameState(game.getState());
  };

  // Check if current player is AI
  const isCurrentPlayerAI = (): boolean => {
    if (gameMode === 'human-vs-human') return false;
    if (gameMode === 'human-vs-ai') {
      return gameState.currentPlayer === PlayerType.TIGER;
    }
    if (gameMode === 'ai-vs-human') {
      return gameState.currentPlayer === PlayerType.GOAT;
    }
    return false;
  };

  // Make AI move
  const makeAIMove = async () => {
    if (!aiEngine || isAIThinking || game.isGameOver()) return;

    setIsAIThinking(true);

    try {
      // Small delay for UX (let user see the thinking indicator)
      await new Promise((resolve) => setTimeout(resolve, 500));

      const move = await aiEngine.getMove(gameState, gameState.currentPlayer);

      // Make the move
      const success = game.makeMove(move);
      if (success) {
        setLastMove(move); // Track last move for animation
        setSelectedPosition(null);
        setHighlightedPositions([]);
        updateGameState();
      } else {
        // If AI returned invalid move, use any valid move as fallback
        console.error('AI returned invalid move, using fallback', move);
        const validMoves = game.getValidMoves();
        if (validMoves.length > 0) {
          const fallbackSuccess = game.makeMove(validMoves[0].move);
          if (fallbackSuccess) {
            setLastMove(validMoves[0].move);
            setSelectedPosition(null);
            setHighlightedPositions([]);
            updateGameState();
          }
        } else {
          console.error('No valid moves available - game should be over');
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
      // Try fallback move on error
      try {
        const validMoves = game.getValidMoves();
        if (validMoves.length > 0) {
          game.makeMove(validMoves[0].move);
          setLastMove(validMoves[0].move);
          updateGameState();
        }
      } catch (fallbackError) {
        console.error('Fallback move also failed', fallbackError);
      }
    } finally {
      setIsAIThinking(false);
    }
  };

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (isCurrentPlayerAI() && gameState.status === GameStatus.IN_PROGRESS) {
      makeAIMove();
    }
  }, [gameState.currentPlayer, gameState.status, gameMode]);

  // Handle point click
  const handlePointClick = (position: Position) => {
    // Ignore clicks when AI is thinking or it's AI's turn
    if (isAIThinking || isCurrentPlayerAI()) return;

    const piece = game.getBoard().getPiece(position);
    const currentPieceType =
      gameState.currentPlayer === PlayerType.TIGER ? PieceType.TIGER : PieceType.GOAT;

    // Special case: Placement phase with goat player clicking empty space
    if (
      gameState.phase === GamePhase.PLACEMENT &&
      gameState.currentPlayer === PlayerType.GOAT &&
      piece === PieceType.EMPTY
    ) {
      // Place a goat
      const move = {
        from: null,
        to: position,
        captured: null,
      };
      const success = game.makeMove(move);

      if (success) {
        setLastMove(move);
        setSelectedPosition(null);
        setHighlightedPositions([]);
        updateGameState();
      }
      return;
    }

    // For all other cases (tiger in placement phase, or movement phase for both):
    // If no piece is selected
    if (selectedPosition === null) {
      // Check if clicked position has a piece belonging to current player
      if (piece === currentPieceType) {
        // Select this piece
        setSelectedPosition(position);

        // Get valid moves from this position
        const validMoves = game.getValidMovesFrom(position);
        const highlights = validMoves.map((vm) => vm.move.to);
        setHighlightedPositions(highlights);
      }
    } else {
      // A piece is already selected
      // Check if clicked position is a valid move destination
      const validMoves = game.getValidMovesFrom(selectedPosition);
      const validMove = validMoves.find(
        (vm) => vm.move.to.row === position.row && vm.move.to.col === position.col
      );

      if (validMove) {
        // Execute the move
        const success = game.makeMove(validMove.move);
        if (success) {
          setLastMove(validMove.move);
          setSelectedPosition(null);
          setHighlightedPositions([]);
          updateGameState();
        }
      } else {
        // Check if clicked on another piece of the same type
        if (piece === currentPieceType) {
          // Select the new piece
          setSelectedPosition(position);
          const validMoves = game.getValidMovesFrom(position);
          const highlights = validMoves.map((vm) => vm.move.to);
          setHighlightedPositions(highlights);
        } else {
          // Deselect
          setSelectedPosition(null);
          setHighlightedPositions([]);
        }
      }
    }
  };

  // Save game statistics when game ends
  const saveGameStatistics = () => {
    if (gameState.status === GameStatus.IN_PROGRESS) return;
    if (gameMode === 'human-vs-human') return; // Only track vs AI games

    const humanSide = gameMode === 'human-vs-ai' ? PlayerType.GOAT : PlayerType.TIGER;
    const winner = gameState.status === GameStatus.TIGER_WIN ? PlayerType.TIGER : PlayerType.GOAT;

    const gameRecord: GameRecord = {
      id: `game_${Date.now()}`,
      timestamp: gameStartTime,
      mode: gameMode,
      aiDifficulty,
      humanSide,
      winner,
      totalMoves: gameState.turnNumber,
      duration: Date.now() - gameStartTime,
      goatsCaptured: gameState.goatsCaptured,
      moves: moveRecords,
      finalState: gameState,
    };

    GameStatisticsTracker.saveGame(gameRecord);
    console.log('Game statistics saved', gameRecord);
  };

  // Detect game end and save statistics
  useEffect(() => {
    if (gameState.status !== GameStatus.IN_PROGRESS) {
      // Small delay to let UI update
      setTimeout(() => {
        saveGameStatistics();
      }, 500);
    }
  }, [gameState.status]);

  // Handle new game
  const handleNewGame = () => {
    game.reset();
    setSelectedPosition(null);
    setHighlightedPositions([]);
    setLastMove(null);
    setGameStartTime(Date.now());
    setMoveRecords([]);
    updateGameState();
  };

  // Handle undo
  const handleUndo = () => {
    const success = game.undoMove();
    if (success) {
      setSelectedPosition(null);
      setHighlightedPositions([]);
      setLastMove(null);
      updateGameState();
    }
  };

  // Show instructions for placement phase
  const getInstructions = () => {
    if (gameState.status !== GameStatus.IN_PROGRESS) {
      return '';
    }

    if (isAIThinking) {
      return 'AI is calculating the best move...';
    }

    if (isCurrentPlayerAI()) {
      return 'AI is playing...';
    }

    if (gameState.phase === GamePhase.PLACEMENT) {
      if (gameState.currentPlayer === PlayerType.GOAT) {
        return 'Click on an empty point to place a goat';
      } else {
        return 'Click on your tiger to select it, then click on a highlighted point to move or capture';
      }
    } else {
      return 'Click on your piece to select it, then click on a highlighted point to move';
    }
  };

  // Handle game mode change
  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
    handleNewGame();
  };

  // Get game mode display name
  const getGameModeName = (mode: GameMode): string => {
    switch (mode) {
      case 'human-vs-human':
        return '👤 vs 👤';
      case 'human-vs-ai':
        return '👤 vs 🤖 (You play Goats)';
      case 'ai-vs-human':
        return '🤖 vs 👤 (You play Tigers)';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Game Mode Selector */}
      <div className="mb-6 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-bold text-gray-800 mb-3">Game Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(['human-vs-human', 'human-vs-ai', 'ai-vs-human'] as GameMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleGameModeChange(mode)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                gameMode === mode
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {getGameModeName(mode)}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-4 text-sm md:text-base text-gray-700 font-medium min-h-[3rem]">
        {getInstructions()}
      </div>

      {/* AI Thinking Indicator - Fixed height to prevent layout shift */}
      <div className="mb-4 h-16">
        {isAIThinking ? (
          <AIThinking
            playerType={gameState.currentPlayer === PlayerType.TIGER ? 'tiger' : 'goat'}
          />
        ) : (
          <div className="h-16" />
        )}
      </div>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Board (takes 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 relative">

            {/* Expand button - top right */}
            <button
              onClick={() => setIsFullscreen(true)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-500 text-gray-600 hover:text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-110 flex items-center justify-center group"
              aria-label="Expand board to fullscreen (press F)"
              title="Fullscreen (F)"
            >
              {/* Expand icon */}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            <BoardCanvas
              board={gameState.board}
              onPointClick={handlePointClick}
              highlightedPositions={highlightedPositions}
              selectedPosition={selectedPosition}
              lastMove={lastMove}
            />
          </div>
        </div>

        {/* Sidebar (takes 1 column) */}
        <div className="space-y-4">
          {/* Game Info */}
          <GameInfo gameState={gameState} />

          {/* Move History */}
          <MoveHistory
            moves={gameState.moveHistory}
            currentPlayer={gameState.currentPlayer}
          />

          {/* Move Analysis (show during active game) */}
          {gameState.status === GameStatus.IN_PROGRESS && gameMode !== 'human-vs-human' && (
            <MoveAnalysis
              gameState={gameState}
              currentPlayer={gameState.currentPlayer}
              isAITurn={isCurrentPlayerAI()}
            />
          )}

          {/* Statistics (show when game is over or between games) */}
          {gameMode !== 'human-vs-human' && (
            <GameStatistics />
          )}

          {/* Diagonal Test (Debug) */}
          {showDiagonalTest && <DiagonalTest />}

          {/* AI Difficulty (only show when playing against AI) */}
          {gameMode !== 'human-vs-human' && (
            <DifficultySelector
              selectedLevel={aiDifficulty}
              onSelectLevel={setAiDifficulty}
              disabled={gameState.status === GameStatus.IN_PROGRESS}
            />
          )}

          {/* Game Controls */}
          <GameControls
            onNewGame={handleNewGame}
            onUndo={handleUndo}
            onOpenRules={() => setIsRulesModalOpen(true)}
            onToggleDiagonalTest={() => setShowDiagonalTest(!showDiagonalTest)}
            canUndo={gameState.moveHistory.length > 0}
            gameStatus={gameState.status}
          />
        </div>
      </div>

      {/* Welcome Modal (first time only) */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={handleWelcomeClose}
        onShowRules={handleWelcomeShowRules}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Game Over Modal */}
      {gameState.status !== GameStatus.IN_PROGRESS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">
              {gameState.status === GameStatus.TIGER_WIN ? '🐅' : '🐐'}
            </div>
            <h2 className="text-3xl font-bold mb-4">
              {gameState.status === GameStatus.TIGER_WIN
                ? 'Tigers Win!'
                : 'Goats Win!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {gameState.status === GameStatus.TIGER_WIN
                ? `Tigers captured ${gameState.goatsCaptured} goats!`
                : 'All tigers are blocked!'}
            </p>
            <button
              onClick={handleNewGame}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Board */}
      {isFullscreen && (
        <FullscreenBoard
          board={gameState.board}
          onPointClick={handlePointClick}
          highlightedPositions={highlightedPositions}
          selectedPosition={selectedPosition}
          lastMove={lastMove}
          gameState={gameState}
          onClose={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
};

export default GameContainer;
